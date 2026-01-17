import DialogBase, { DialogState } from "./DialogBase";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import GameCommonSound from "./GameCommonSound";
import SDefine from "./global_utility/SDefine";
import { Utility } from "./global_utility/Utility";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;



/**
 * HighRoller条款弹窗组件
 * 负责显示服务条款/隐私政策弹窗，支持跳转对应URL、点击接受关闭弹窗
 */
@ccclass()
export default class TermsPopup_HighRoller extends DialogBase {
    // ===== 组件属性（绑定到编辑器）=====
    @property(cc.Button)
    private termsButton!: cc.Button; // 服务条款按钮

    @property(cc.Button)
    private policyButton!: cc.Button; // 隐私政策按钮

    @property(cc.Button)
    private acceptButton!: cc.Button; // 接受按钮

    // ===== 静态常量 =====
    private static readonly POPUP_RES_PATH = "Service/01_Content/Terms/TermsPopup_HighRoller"; // 弹窗预制体路径

    // ===== 静态方法 =====
    /**
     * 获取弹窗实例（异步加载预制体）
     * @param callback 加载完成回调 (error, popup实例)
     */
    public static getPopup(callback: (error: Error | null, popup: TermsPopup_HighRoller | null) => void): void {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 加载弹窗预制体
        cc.loader.loadRes(TermsPopup_HighRoller.POPUP_RES_PATH, (error: Error | null, asset: cc.Prefab) => {
            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);

            // 加载失败：上报异常并执行回调
            if (error) {
                const errorObj = new Error(
                    `cc.loader.loadRes fail ${TermsPopup_HighRoller.POPUP_RES_PATH}: ${JSON.stringify(error)}`
                );
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecord(FHLogType.Exception, errorObj)
                );
                callback && callback(error, null);
                return;
            }

            // 加载成功：实例化预制体并获取组件
            if (callback) {
                const popupNode = cc.instantiate(asset);
                const popupComponent = popupNode.getComponent(TermsPopup_HighRoller);
                popupNode.active = false; // 初始隐藏
                callback(null, popupComponent);
            }
        });
    }

    // ===== 生命周期方法 =====
    /**
     * 组件加载时初始化
     */
    protected onLoad(): void {
        // 初始化DialogBase基类
        this.initDailogBase();

        // 绑定按钮点击事件
        this._bindButtonEvents();
    }

    // ===== 私有方法 =====
    /**
     * 绑定按钮点击事件
     */
    private _bindButtonEvents(): void {
        // 服务条款按钮 → 触发showTemrs方法
        this.termsButton.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "TermsPopup_HighRoller", "showTemrs", "")
        );

        // 隐私政策按钮 → 触发showPolicy方法
        this.policyButton.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "TermsPopup_HighRoller", "showPolicy", "")
        );

        // 接受按钮 → 触发onClickAccept方法
        this.acceptButton.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "TermsPopup_HighRoller", "onClickAccept", "")
        );
    }

    // ===== 公共方法 =====
    /**
     * 打开弹窗（带动画效果）
     * @returns 弹窗实例（链式调用）
     */
    public open(): TermsPopup_HighRoller {
        // 播放弹窗音效
        GameCommonSound.playFxOnce("pop_etc");

        // 初始化弹窗样式（透明+缩小）
        this.rootNode.opacity = 0;
        this.rootNode.setScale(0.2, 0.2);

        // 创建动画：淡入(0.2秒) + 缩放(0.3秒，回退缓动)
        const openAnimation = cc.spawn(
            cc.fadeIn(0.2),
            cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
        );

        // 执行基类打开逻辑（播放动画）
        this._open(openAnimation);

        return this;
    }

    /**
     * 显示服务条款（跳转URL）
     */
    public showTemrs(): void {
        cc.sys.openURL(SDefine.TERMS_OF_SERVICE_URL);
    }

    /**
     * 显示隐私政策（跳转URL）
     */
    public showPolicy(): void {
        cc.sys.openURL(SDefine.PRIVACY_POLICY_URL);
    }

    /**
     * 点击接受按钮回调
     */
    public onClickAccept(): void {
        this.close();
    }

    /**
     * 后退按钮处理（禁用后退关闭）
     * @returns false 表示不处理后退事件
     */
    public onBackBtnProcess(): boolean {
        return false;
    }

    /**
     * 关闭弹窗（带动画效果）
     */
    public close(): void {
        // 避免重复关闭
        if (this.isStateClose()) return;

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 设置弹窗状态为关闭
        this.setState(DialogState.Close);

        // 清理资源/状态
        this.clear();

        // 执行基类关闭逻辑（淡出动画，0.15秒）
        this._close(cc.fadeOut(0.15));
    }
}