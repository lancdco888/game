// CommonPopup.ts
const { ccclass, property } = cc._decorator;
import DialogBase, { DialogState } from "../DialogBase";
import GameCommonSound from "../GameCommonSound";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import PopupManager from "../manager/PopupManager";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import LanguageManager from "../Config/LanguageManager";
import HRVServiceUtil from "../HRVService/HRVServiceUtil";
import { Utility } from "../global_utility/Utility";

/**
 * 通用弹窗核心组件 (CommonPopup)
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 继承 DialogBase 弹窗基类，项目全局通用弹窗组件，支持：
 * 1. 单按钮/双按钮弹窗自由切换
 * 2. 标题+富文本/普通文本内容展示
 * 3. 多语言文本适配
 * 4. 弹窗倒计时功能
 * 5. 延迟关闭/点击确定不关闭弹窗配置
 * 6. 全局静态调用：认证错误弹窗、登录错误弹窗、通用弹窗加载
 * 7. 内购/支付/游戏通用错误提示统一入口
 * 项目中所有弹窗均基于此类封装，包含 IAP内购失败弹窗 核心调用
 */
@ccclass
export default class CommonPopup extends DialogBase {
    // ===================== 序列化属性 - 与预制体绑定 一一对应 =====================
    @property(cc.RichText)
    infoLabel: cc.RichText = null;          // 富文本信息标签(主)

    @property(cc.Label)
    infoLabel2: cc.Label = null;            // 普通文本信息标签(副)

    @property(cc.Label)
    titleLabel: cc.Label = null;            // 弹窗标题标签

    @property(cc.Label)
    okLabel: cc.Label = null;               // 确定按钮文本

    @property(cc.Label)
    cancelLabel: cc.Label = null;           // 取消按钮文本

    @property(cc.Button)
    okBtn: cc.Button = null;                // 双按钮-确定按钮

    @property(cc.Button)
    cancelBtn: cc.Button = null;            // 双按钮-取消按钮

    @property(cc.Label)
    remainTimeLabel: cc.Label = null;       // 倒计时文本标签

    @property(cc.Button)
    okSoloBtn: cc.Button = null;            // 单按钮-确定按钮

    @property(cc.Label)
    okSoleLabel: cc.Label = null;           // 单按钮-文本标签

    @property(cc.Node)
    nodeImage: cc.Node = null;              // 弹窗配图节点

    // ===================== 成员属性 =====================
    private okCallback: Function = null;            // 确定按钮回调
    private cancelCallback: Function = null;        // 取消按钮回调
    private commonCloseCallback: Function = null;   // 关闭按钮回调
    private remainTimeOverCallback: Function = null;// 倒计时结束回调

    private popupType: number = 0;                  // 弹窗类型 0=单按钮 1=双按钮
    private clickType: number = 0;                  // 点击类型 0=确定 1=取消 2=关闭按钮
    private _dealyClose: boolean = false;           // 延迟关闭标记
    private _dontCloseOnOkClick: boolean = false;   // 点击确定是否不关闭弹窗

    private _startTime: number = 0;                 // 倒计时开始时间戳
    private _remainTime: number = 0;                // 倒计时总时长(秒)

    // ===================== 全局静态方法 - 项目中外部调用的核心入口 =====================
    /**
     * 获取通用弹窗(无类型)
     * @param callback 加载完成回调 (err, popup实例)
     */
    public static getCommonPopup(callback: (err: Error, popup: CommonPopup) => void): void {
        this.loadCommonPopup("Service/00_Common/CommonPopup/CommonPopup", callback);
    }

    /**
     * 获取指定类型的弹窗
     * @param type 弹窗类型标识
     * @param callback 加载完成回调
     */
    public static getPopup(type: string, callback: (err: Error, popup: CommonPopup) => void): void {
        const path = `Service/00_Common/CommonPopup/CommonPopup_%s`.format(type);
        this.loadCommonPopup(path, callback);
    }

    /**
     * 获取置顶弹窗
     * @param type 弹窗类型标识
     * @param callback 加载完成回调
     */
    public static getPinToTopPopup(type: string, callback: (err: Error, popup: CommonPopup) => void): void {
        const path = `Service/01_Content/PinToTop/CommonPopup_PinToTop%s`.format(type);
        this.loadCommonPopup(path, callback);
    }

    /**
     * 加载弹窗预制体核心方法
     * @param resPath 资源路径
     * @param callback 加载完成回调
     */
    private static loadCommonPopup(resPath: string, callback: (err: Error, popup: CommonPopup) => void): void {
        if (callback) PopupManager.Instance().showDisplayProgress(true);
        cc.loader.loadRes(resPath, (err, prefab) => {
            if (callback) PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                callback && callback(err, null);
                return;
            }
            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(CommonPopup);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    /**
     * 异步加载 认证错误弹窗 并关闭
     * @param errCode 认证错误码
     * @returns Promise<void>
     */
    public static async asyncAuthErrorPopupClose(errCode: number): Promise<any> {
        return new Promise((resolve) => {
            this.authErrorPopup(errCode, (res) => {
                resolve(res);
            });
        });
    }

    /**
     * 【核心静态方法】展示认证错误弹窗 (登录/绑定/三方账号授权失败通用弹窗)
     * 包含 FB/Apple/LINE 所有授权错误码的文案适配，项目核心弹窗
     * @param errCode 错误码 (SDefine.ERR_XXX)
     * @param callback 弹窗关闭回调
     */
    public static authErrorPopup(errCode: number, callback?: (res: number) => void): void {
        const config = {
            okBtnStr: "SUPPORT",
            cancelBtnStr: "CLOSE",
            okCallback: null,
            cancelCallback: null,
            titleStr: "SORRY",
            infoStr: "Authentication failed. If the error persists, please tap the 'SUPPORT' button.",
            popType: "Auth_Close"
        };

        // 确定按钮回调 - 跳转客服
        config.okCallback = () => {
            //UserInfo.goCustomerSupport();
            callback && callback(config.popType === "Auth_Close" ? 0 : 1);
        };

        // 取消按钮回调
        config.cancelCallback = () => {
            callback && callback(config.popType === "Auth_Close" ? 0 : 1);
        };

        // 根据错误码匹配对应文案
        switch (errCode) {
            case SDefine.ERR_AuthInvalidUID:
            case SDefine.ERR_AuthUIDDeviceIDDoNotMatch:
            case SDefine.ERR_AuthAccountUserStateInvalid:
                config.infoStr = "Faulty user and device information.\nIf the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthInvalidAUDID:
                config.infoStr = "The device’s authentication information is incorrect. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthUIDFacebookIDDoNotMatch:
            case SDefine.ERR_AuthAccountFBIDnReqFacebookIDDoNotMatch:
                config.infoStr = "This Facebook ID doesn't match the device's User ID. Sign in with the Facebook ID that was previously synced on this device  or as a Guest.";
                config.cancelBtnStr = "PLAY AS GUEST";
                config.popType = "Auth_Guest";
                break;
            case SDefine.ERR_AuthUIDAppleIDDoNotMatch:
            case SDefine.ERR_AuthAccountAppleIDnReqAppleIDDoNotMatch:
                config.infoStr = "This Apple ID doesn't match the device's User ID. Sign in with the Apple ID that was previously synced on this device or as a Guest.";
                config.cancelBtnStr = "PLAY AS GUEST";
                config.popType = "Auth_Guest";
                break;
            case SDefine.ERR_AuthUIDLineIDDoNotMatch:
            case SDefine.ERR_AuthAccountLineIDnReqLineIDDoNotMatch:
                config.infoStr = "This LINE ID doesn't match the device's User ID. Sign in with the LINE ID that was previously synced on this device or as a Guest.";
                config.cancelBtnStr = "PLAY AS GUEST";
                config.popType = "Auth_Guest";
                break;
            case SDefine.ERR_AuthFacebookSyncError:
            case SDefine.ERR_AuthInvalidFacebookToken:
                config.infoStr = "Faulty Facebook authentication information. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthInvalidAppleToken:
                config.infoStr = "Faulty Apple authentication information. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthInvalidLineToken:
                config.infoStr = "Faulty LINE authentication information. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthCantConversionLinkedFacebookUID:
            case SDefine.ERR_AUTH_FacebookLinked_otherFBID:
                config.infoStr = "The Facebook account is already linked to a different user ID, and is not possible to log in to this device. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthCantConversionLinkedAppleID:
            case SDefine.ERR_AUTH_AppleLinked_otherAppleID:
                config.infoStr = "The Apple account is already linked to a different user ID, and is not possible to log in to this device. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthCantConversionLinkedLineID:
            case SDefine.ERR_AUTH_LineLinked_otherLineID:
                config.infoStr = "The LINE account is already linked to a different user ID, and is not possible to log in to this device. If the error persists, please tap the 'SUPPORT' button.";
                break;
            case SDefine.ERR_AuthInvalidRequest:
            case SDefine.ERR_AuthInvalidServiceType:
                break;
        }

        // 加载弹窗并展示
        PopupManager.Instance().showDisplayProgress(true);
        this.getPopup(config.popType, (err, popup) => {
            PopupManager.Instance().showDisplayProgress(false);
            popup.open()
                .setOkBtn(config.okBtnStr, config.okCallback)
                .setCancelBtn(config.cancelBtnStr, config.cancelCallback)
                .setDontCloseOnOkClick(true)
                .setInfo(config.titleStr, config.infoStr);
        });
    }

    /**
     * 展示登录错误弹窗
     * @param errMsg 错误信息文本
     */
    public static loginErrorPopup(errMsg: string): void {
        let btnText = "RETRY";
        if (Utility.isFacebookInstant()) btnText = "CLOSE";

        this.getCommonPopup((err, popup) => {
            if (err) {
                cc.error("Get CommonPopup fail.");
                return;
            }
            cc.log("CommonPopup Open");
            popup.open()
                .setInfo("NOTICE", errMsg, false)
                .setOkBtn(btnText, () => {
                    HRVServiceUtil.restartGame();
                });
            
            // 移动端增加关闭按钮 退出游戏
            if (Utility.isMobileGame()) {
                popup.setCloseBtn(true, () => {
                    TSUtility.endGame();
                });
            }
        });
    }

    // ===================== 生命周期方法 =====================
    onLoad(): void {
        this.initDailogBase();
        // 绑定确定按钮点击事件
        if (this.okBtn) {
            this.okBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "CommonPopup", "onClickOK", ""));
        }
        // 绑定单按钮点击事件
        if (this.okSoloBtn) {
            this.okSoloBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "CommonPopup", "onClickOK", ""));
        }
        // 绑定取消按钮点击事件
        if (this.cancelBtn) {
            this.cancelBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "CommonPopup", "onClickCancel", ""));
        }
    }

    onDestroy(): void {
        cc.log("CommonPopup Destroyed");
    }

    /**
     * 打开弹窗 (重写父类方法)
     * @returns this 链式调用
     */
    open(): CommonPopup {
        this.rootNode.opacity = 0;
        this._open(DialogBase.getFadeInAction(0.3));
        this.init();
        return this;
    }

    /**
     * 初始化弹窗默认状态
     */
    init(): void {
        if (this.okLabel) this.okLabel.string = "OK";
        if (this.cancelLabel) this.cancelLabel.string = "CANCEL";
        if (this.titleLabel) this.titleLabel.string = "";
        if (this.infoLabel) this.infoLabel.string = "";
        if (this.infoLabel2) this.infoLabel2.string = "";

        this.popupType = 0;
        this.clickType = 0;
        this.okCallback = null;
        this.cancelCallback = null;
        
        if (this.okBtn) this.okBtn.node.active = false;
        if (this.cancelBtn) this.cancelBtn.node.active = false;
    }

    /**
     * 关闭弹窗 (重写父类方法) 核心逻辑
     * 执行对应回调 + 清除状态 + 执行关闭动画
     */
    close(): void {
        if (this.isStateClose()) return;
        this.setState(DialogState.Close);

        // 执行对应回调
        if (this.clickType === 0 && this.okCallback) {
            this.okCallback();
            this.okCallback = null;
        }
        if (this.clickType === 1 && this.cancelCallback) {
            this.cancelCallback();
            this.cancelCallback = null;
        }
        if (this.clickType === 2 && this.commonCloseCallback) {
            this.commonCloseCallback();
            this.commonCloseCallback = null;
        }

        this.clear();
        if (!this._dealyClose) {
            this._close(DialogBase.getFadeOutAction(0.3));
        }
    }

    /**
     * 清除弹窗状态 & 禁用按钮
     */
    clear(): void {
        if (this.okBtn) this.okBtn.enabled = false;
        if (this.cancelBtn) this.cancelBtn.enabled = false;
        if (this.okSoloBtn) this.okSoloBtn.enabled = false;
        super.clear();
    }

    // ===================== 弹窗配置方法 =====================
    /**
     * 设置延迟关闭标记
     */
    setDelayColse(): void {
        this._dealyClose = true;
    }

    /**
     * 执行延迟关闭
     */
    closeDelay(): void {
        if (this._dealyClose) {
            this._close(DialogBase.getFadeOutAction(0.3));
        }
    }

    /**
     * 点击确定按钮回调
     */
    onClickOK(): void {
        GameCommonSound.playFxOnce("btn_etc");
        if (!this._dontCloseOnOkClick) {
            this.clickType = 0;
            this.close();
        } else {
            if (this.okCallback) this.okCallback();
        }
    }

    /**
     * 点击取消按钮回调
     */
    onClickCancel(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.clickType = 1;
        this.close();
    }

    /**
     * 点击关闭按钮回调 (重写父类方法)
     */
    onClickClose(): void {
        if (this.commonCloseCallback) {
            this.clickType = 2;
        } else {
            this.clickType = this.popupType === 0 ? 0 : 1;
        }
        super.onClickClose();
    }

    /**
     * 返回键处理 (重写父类方法)
     * @returns boolean
     */
    onBackBtnProcess(): boolean {
        this.onClickClose();
        return true;
    }

    /**
     * 自动适配按钮显示状态：单按钮/双按钮切换
     */
    setButtonPosition(): void {
        if (!this.cancelBtn || !this.cancelBtn.node.active) {
            // 显示单按钮
            if (this.okSoloBtn) this.okSoloBtn.node.active = true;
            if (this.okBtn) this.okBtn.node.active = false;
        } else {
            // 显示双按钮
            if (this.okSoloBtn) this.okSoloBtn.node.active = false;
            if (this.okBtn) this.okBtn.node.active = true;
        }
    }

    /**
     * 设置弹窗标题+内容 (核心方法)
     * @param title 标题文本
     * @param info 内容文本
     * @param useLang 是否使用多语言适配 (默认true)
     * @returns this 链式调用
     */
    setInfo(title: string, info: string, useLang: boolean = true): CommonPopup {
        if (LanguageManager.Instance() && useLang) {
            if (this.titleLabel) this.titleLabel.string = LanguageManager.Instance().getCommonText(title);
            if (this.infoLabel) this.infoLabel.string = LanguageManager.Instance().getCommonText(info);
            if (this.infoLabel2) this.infoLabel2.string = LanguageManager.Instance().getCommonText(info);
        } else {
            if (this.titleLabel) this.titleLabel.string = title;
            if (this.infoLabel) this.infoLabel.string = info;
            if (this.infoLabel2) this.infoLabel2.string = info;
        }
        return this;
    }

    /**
     * 设置关闭按钮显示+回调
     * @param active 是否显示
     * @param callback 关闭回调
     * @returns this 链式调用
     */
    setCloseBtn(active: boolean, callback: Function): CommonPopup {
        this.closeBtn.node.active = active;
        this.commonCloseCallback = callback;
        return this;
    }

    /**
     * 设置点击确定按钮是否不关闭弹窗
     * @param flag true=不关闭 false=关闭
     * @returns this 链式调用
     */
    setDontCloseOnOkClick(flag: boolean): CommonPopup {
        this._dontCloseOnOkClick = flag;
        return this;
    }

    /**
     * 设置确定按钮文本+回调
     * @param str 按钮文本
     * @param callback 点击回调
     * @returns this 链式调用
     */
    setOkBtn(str: string, callback: Function): CommonPopup {
        if (this.okBtn) this.okBtn.node.active = true;
        if (this.okLabel) this.okLabel.string = str;
        if (this.okSoleLabel) this.okSoleLabel.string = str;
        
        this.okCallback = callback;
        this.setButtonPosition();
        return this;
    }

    /**
     * 设置取消按钮文本+回调
     * @param str 按钮文本
     * @param callback 点击回调
     * @returns this 链式调用
     */
    setCancelBtn(str: string, callback: Function): CommonPopup {
        if (this.cancelBtn) this.cancelBtn.node.active = true;
        if (this.cancelLabel) this.cancelLabel.string = str;
        
        this.popupType = 1;
        this.cancelCallback = callback;
        this.setButtonPosition();
        return this;
    }

    /**
     * 设置弹窗配图显示/隐藏
     * @param active 是否显示
     * @returns this 链式调用
     */
    setImageActive(active: boolean): CommonPopup {
        if (TSUtility.isValid(this.nodeImage)) {
            this.nodeImage.active = active;
        }
        return this;
    }

    /**
     * 设置弹窗类型
     * @param type 类型值
     */
    setPopupType(type: number): void {
        this.popupType = type;
    }

    /**
     * 设置弹窗倒计时
     * @param time 倒计时时长(秒)
     * @param callback 倒计时结束回调
     * @returns this 链式调用
     */
    setRemainTime(time: number, callback: Function): CommonPopup {
        this._startTime = Utility.getUnixTimestamp();
        this._remainTime = time;
        this.remainTimeOverCallback = callback;

        const timeFormat = new TimeFormatHelper(time);
        if (this.remainTimeLabel) this.remainTimeLabel.string = timeFormat.getHourTimeString();
        
        this.schedule(this.updateRemainTime, 1);
        return this;
    }

    /**
     * 更新倒计时文本
     */
    updateRemainTime(): void {
        const now = Utility.getUnixTimestamp();
        let remain = this._remainTime - (now - this._startTime);
        remain = Math.max(0, remain);

        const timeFormat = new TimeFormatHelper(remain);
        if (this.remainTimeLabel) this.remainTimeLabel.string = timeFormat.getHourTimeString();

        // 倒计时结束
        if (remain <= 0) {
            this.unschedule(this.updateRemainTime);
            if (this.remainTimeOverCallback) this.remainTimeOverCallback();
        }
    }
}