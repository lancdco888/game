import Analytics from "./Network/Analytics";
import LoadingProgressBar from "./UI/LoadingProgressBar";
import NativeUtil from "./global_utility/NativeUtil";
import SDefine from "./global_utility/SDefine";
import { Utility } from "./global_utility/Utility";

const { ccclass, property } = cc._decorator;



/**
 * 启动页弹窗组件
 * 负责启动流程中的进度展示、登录按钮控制、背景层显隐等核心逻辑
 */
@ccclass()
export default class IntroPopup extends cc.Component {
    // ===== 可序列化属性（对应编辑器赋值）=====
    @property(cc.Node)
    public progressInfoGroup: cc.Node = null;

    @property(cc.Node)
    public loginBtnsGroupForMobile: cc.Node = null;

    @property(cc.Node)
    public baseBGLayer: cc.Node = null;

    @property(cc.Button)
    public facebookLoginBtn: cc.Button = null;

    @property(cc.Button)
    public guestLoginBtn: cc.Button = null;

    @property(cc.Button)
    public appleLoginBtn: cc.Button = null;

    @property(cc.Label)
    public infoLabel: cc.Label = null;

    @property(LoadingProgressBar)
    public progressBar: LoadingProgressBar = null;

    @property(cc.Label)
    public versionLabel: cc.Label = null;

    @property(cc.Node)
    public blockBG: cc.Node = null;

    @property(cc.Node)
    public highrollerMark_Node: cc.Node = null;

    @property(cc.Node)
    public majorRolloerMark_Node: cc.Node = null;

    // ===== 静态属性 =====
    private static _instance: IntroPopup = null;

    // ===== 私有回调属性 =====
    private _onClickFacebookCallback: (() => void) = null;
    private _onClickGuestCallback: (() => void) = null;
    private _onClickAppleLoginCallback: (() => void) = null;
    private _onClickLineLoginCallback: (() => void) = null;

    /**
     * 获取弹窗单例实例
     */
    public static getIntroPopup(): IntroPopup {
        return IntroPopup._instance;
    }

    /**
     * 设置节点为常驻根节点
     */
    public setPersistNode(): void {
        const canvasSize = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
        this.node.removeFromParent(false);
        cc.game.addPersistRootNode(this.node);
        this.node.setPosition(canvasSize.width / 2, canvasSize.height / 2);
        this.node.setContentSize(canvasSize);
        IntroPopup._instance = this;
    }

    /**
     * 移除常驻根节点
     */
    public removePresistNode(): void {
        cc.game.removePersistRootNode(this.node);
        IntroPopup._instance = null;
    }

    /**
     * 组件加载时初始化
     */
    public onLoad(): void {
        // 初始化blockBG显示状态
        if (this.blockBG) {
            this.blockBG.active = false;
        }

        // 绑定Facebook登录按钮点击事件
        if (this.facebookLoginBtn) {
            this.facebookLoginBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "IntroPopup", "onClickFacebookLogin", "")
            );
        }

        // 绑定游客登录按钮点击事件
        if (this.guestLoginBtn) {
            this.guestLoginBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "IntroPopup", "onClickGuestLogin", "")
            );
        }

        // 绑定Apple登录按钮点击事件
        if (this.appleLoginBtn) {
            this.appleLoginBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "IntroPopup", "onClickAppleLogin", "")
            );
        }
    }

    /**
     * 组件销毁时回调
     */
    public onDestroy(): void {
        cc.log("destroy intro");
    }

    /**
     * 清空弹窗显示内容（进度、文本等）
     */
    public clear(): void {
        // 清空信息文本
        if (this.infoLabel) {
            this.infoLabel.string = "";
        }

        // 重置进度条
        if (this.progressBar) {
            if (this.progressBar.percentInfo) {
                this.progressBar.percentInfo.string = "";
            }
            this.progressBar.setProgress(0);
        }

        // 清空版本文本
        if (this.versionLabel) {
            this.versionLabel.string = "";
        }
    }

    /**
     * 显示/隐藏进度信息组
     * @param isShow 是否显示
     */
    public showProgressGroup(isShow: boolean): void {
        if (this.progressInfoGroup) {
            this.progressInfoGroup.active = isShow;
        }
    }

    /**
     * 显示/隐藏移动端登录按钮组
     * @param isShow 是否显示
     */
    public showLoginBtnGroup(isShow: boolean): void {
        // 处理Apple登录按钮显示逻辑
        if (isShow && this.appleLoginBtn) {
            if (SDefine.Use_Mobile_Auth_v2) {
                this.appleLoginBtn.node.active = false;//NativeUtil.isSupportAppleLogin();
            } else {
                this.appleLoginBtn.node.active = false;
            }
        }

        // 显示/隐藏登录按钮组
        if (this.loginBtnsGroupForMobile) {
            this.loginBtnsGroupForMobile.active = isShow;
        }

        // 显示登录按钮时记录埋点
        if (isShow) {
            Analytics.loginView();
        }
    }

    /**
     * 显示/隐藏基础背景层
     * @param isShow 是否显示
     */
    public showBaseBGLayer(isShow: boolean): void {
        // 处理基础背景层显隐（带淡出动画）
        if (this.baseBGLayer) {
            if (!isShow) {
                this.baseBGLayer.runAction(cc.fadeOut(0.4));
            } else {
                this.baseBGLayer.active = isShow;
            }
        }

        // 处理阻塞背景层显隐（带淡入动画）
        if (this.blockBG) {
            if (!isShow) {
                this.blockBG.active = !isShow;
                this.blockBG.opacity = 0;
                this.blockBG.runAction(cc.fadeIn(0.4));
            } else {
                this.blockBG.active = !isShow;
            }
        }
    }

    /**
     * 设置进度信息文本
     * @param text 文本内容
     */
    public setInfoText(text: string): void {
        if (this.infoLabel) {
            if (!this.infoLabel.node.active) {
                this.infoLabel.node.active = true;
            }
            this.infoLabel.string = text;
        }
    }

    /**
     * 设置进度条进度
     * @param progress 进度值（0-1）
     */
    public setProgress(progress: number): void {
        if (this.progressBar) {
            this.progressBar.setProgress(progress);
        }
    }

    /**
     * 设置Facebook登录点击回调
     * @param callback 回调函数
     */
    public setOnClickFacebookCallback(callback: () => void): void {
        this._onClickFacebookCallback = callback;
    }

    /**
     * 设置游客登录点击回调
     * @param callback 回调函数
     */
    public setOnClickGuestCallback(callback: () => void): void {
        this._onClickGuestCallback = callback;
    }

    /**
     * 设置Apple登录点击回调
     * @param callback 回调函数
     */
    public setOnClickAppleLoginCallback(callback: () => void): void {
        this._onClickAppleLoginCallback = callback;
    }

    /**
     * 设置Line登录点击回调
     * @param callback 回调函数
     */
    public setOnClickLineLoginCallback(callback: () => void): void {
        this._onClickLineLoginCallback = callback;
    }

    /**
     * 重置所有登录点击回调
     */
    public resetOnClickCallback(): void {
        this._onClickFacebookCallback = null;
        this._onClickGuestCallback = null;
        this._onClickAppleLoginCallback = null;
        this._onClickLineLoginCallback = null;
    }

    /**
     * Facebook登录按钮点击事件
     */
    public onClickFacebookLogin(): void {
        if (this._onClickFacebookCallback) {
            Analytics.loginClick();
            this._onClickFacebookCallback();
        }
    }

    /**
     * 游客登录按钮点击事件
     */
    public onClickGuestLogin(): void {
        if (this._onClickGuestCallback) {
            Analytics.loginClick();
            this._onClickGuestCallback();
        }
    }

    /**
     * Apple登录按钮点击事件
     */
    public onClickAppleLogin(): void {
        if (this._onClickAppleLoginCallback) {
            Analytics.loginClick();
            this._onClickAppleLoginCallback();
        }
    }

    /**
     * Line登录按钮点击事件
     */
    public onClickLineLogin(): void {
        if (this._onClickLineLoginCallback) {
            Analytics.loginClick();
            this._onClickLineLoginCallback();
        }
    }
}