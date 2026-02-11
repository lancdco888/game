import DialogBase, { DialogState } from "../DialogBase";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import GameCommonSound from "../GameCommonSound";
import { PurchaseEntryReason } from "../Network/CommonServer";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import PopupManager, { OpenPopupInfo } from "./PopupManager";

const { ccclass, property } = cc._decorator;

/**
 * 新纪录惊喜弹窗组件（继承DialogBase）
 * 负责新纪录金额展示、FB Instant分享、自动关闭、RecordBreaker弹窗预约等逻辑
 */
@ccclass()
export default class AstonishingPopup extends DialogBase {
    // 当前赢币金额标签
    @property(cc.Label)
    public current_win_Label: cc.Label | null = null;

    // 上一次赢币金额标签
    @property(cc.Label)
    public prev_win_Label: cc.Label | null = null;

    // 普通关闭按钮
    @property(cc.Button)
    public ok_Button: cc.Button | null = null;

    // FB Instant分享关闭按钮
    @property(cc.Button)
    public ok_Button_Instant: cc.Button | null = null;

    // // 截图组件
    // @property(Instant_ShareiMG)
    // public screenShot: Instant_ShareiMG | null = null;

    // 是否启用FB Instant shareAsync接口
    private _isEnableShareasync: boolean = false;

    /**
     * 静态方法：加载并获取AstonishingPopup弹窗实例
     * @param callback 回调函数（error:加载错误, popup:弹窗实例）
     */
    public static getPopup(callback: (error: Error | null, popup: AstonishingPopup | null) => void): void {
        const popupPath = "Service/01_Offer/RecordBreaker/AstonishingPopup";
        
        // 加载弹窗预制体
        cc.loader.loadRes(popupPath, (error: Error | null, prefab: any) => {
            if (error) {
                // 加载失败：记录异常日志并执行回调
                const errorMsg = new Error(`cc.loader.loadRes fail ${popupPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg));
                callback(error, null);
                return;
            }

            // 加载成功：实例化预制体并获取组件
            const popupNode = cc.instantiate(prefab);
            popupNode.active = false;
            const popupComp = popupNode.getComponent(AstonishingPopup);
            
            callback(null, popupComp);
        });
    }

    /**
     * 组件加载时执行（Cocos生命周期）
     * 初始化DialogBase + 绑定按钮事件 + 判断FB Instant环境
     */
    public onLoad(): void {
        // 初始化DialogBase基类
        this.initDailogBase();

        // 绑定普通关闭按钮点击事件
        if (this.ok_Button) {
            this.ok_Button.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "AstonishingPopup", "onClickClose", "")
            );
        }

        // 绑定FB Instant分享关闭按钮点击事件
        if (this.ok_Button_Instant) {
            this.ok_Button_Instant.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "AstonishingPopup", "onClickShareClose", "")
            );
        }

        // 判断是否为FB Instant环境，检查shareAsync支持性
        if (Utility.isFacebookInstant()) {
            // const supportedAPIs = FBInstant.getSupportedAPIs();
            // if (this.contains(supportedAPIs, "shareAsync")) {
            //     cc.log("Can Use shareAsync");
            //     this._isEnableShareasync = true;
            //     this.ok_Button!.node.active = false;
            //     this.ok_Button_Instant!.node.active = true;
            // } else {
                cc.log("Can't Use shareAsync");
                this._isEnableShareasync = false;
                this.ok_Button!.node.active = true;
                this.ok_Button_Instant!.node.active = false;
            // }
        } else {
            // 非FB Instant环境：显示普通关闭按钮
            this.ok_Button!.node.active = true;
            this.ok_Button_Instant!.node.active = false;
        }
    }

    /**
     * 检查数组是否包含指定元素（兼容IE的indexOf替代）
     * @param arr 目标数组
     * @param item 要检查的元素
     * @returns 是否包含
     */
    public contains(arr: string[], item: string): boolean {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    /**
     * 打开弹窗（显示新纪录金额，6秒后自动关闭）
     * @param currentWin 本次赢币金额（新纪录）
     * @param prevWin 上一次赢币金额
     * @returns 弹窗实例
     */
    public open(currentWin: number, prevWin: number): AstonishingPopup {
        // 播放弹窗音效
        GameCommonSound.playFxOnce("pop_etc");

        // 设置金额标签（格式化数字）
        if (this.current_win_Label) {
            this.current_win_Label.string = CurrencyFormatHelper.formatNumber(currentWin);
        }
        if (this.prev_win_Label) {
            this.prev_win_Label.string = CurrencyFormatHelper.formatNumber(prevWin);
        }

        // 更新用户最大赢币记录
        UserInfo.instance().setBiggestWinCoin(currentWin);

        // 执行基类的_open方法（淡入动画），6秒后自动关闭
        this._open(DialogBase.getFadeInAction(null), true, () => {
            this.scheduleOnce(() => {
                this.close();
            }, 6);
        });

        return this;
    }

    /**
     * FB Instant分享关闭按钮点击事件
     * 执行截图分享 + 关闭弹窗 + 检查FirstBargainSale弹窗
     */
    public onClickShareClose(): void {
        // 执行截图
        // const screenshotData = this.screenShot!.TakeScreenShot();

        // // 调用FB Instant分享接口
        // FBInstant.shareAsync({
        //     image: screenshotData,
        //     text: "The BIG Win Slot Machines are ready.",
        //     data: { hrv_source: "FBInstant_Share" }
        // }).then(() => {
        //     // 分享成功（空处理，原JS逻辑）
        // }).catch((error: Error) => {
        //     cc.log(error.message);
        // });

        // // 判断是否启用首次优惠弹窗
        // let isFirstBargainAvailable = false;
        // if (ServiceInfoManager.instance().isEnable1stBargain() === 1) {
        //     const popInfo = FirstBargainSaleManager.Instance().getOpenablePopInfo(false);
        //     isFirstBargainAvailable = popInfo !== null && popInfo.isAvailable();
        // }

        // // 非首次优惠弹窗场景：处理PopupManager进度并关闭
        // if (
        //     !ServiceInfoManager.BOOL_TUTORIAL_COME_IN &&
        //     ServiceInfoManager.instance().isEpicWinOffer() === 0 &&
        //     isFirstBargainAvailable
        // ) {
        //     return false;
        // }

        PopupManager.Instance().showDisplayProgress(true);
        PopupManager.Instance().showDisplayProgress(false);
        this.close();
    }

    /**
     * 普通关闭按钮点击事件
     * 播放音效 + 检查FirstBargainSale弹窗 + 关闭弹窗
     */
    public onClickClose(): void {
        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // // 判断是否启用首次优惠弹窗（原JS仅调用无返回，保留逻辑）
        // if (ServiceInfoManager.instance().isEnable1stBargain() === 1) {
        //     const popInfo = FirstBargainSaleManager.Instance().getOpenablePopInfo(false);
        //     if (popInfo !== null && popInfo.isAvailable()) {
        //         // 原JS无后续逻辑，保留判断
        //     }
        // }

        // 关闭弹窗
        this.close();
    }

    /**
     * 添加新纪录弹窗（RecordBreakerPopup）到PopupManager
     * @returns 弹窗打开信息对象
     */
    public addNewRecordPopup(): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();
        popupInfo.type = "NewRecord";
        popupInfo.openCallback = (): void => {
            // 记录弹窗打开时间 + 添加到ServiceInfoManager
            // ServiceInfoManager.instance().addSpinOpenPopup("RecordBreaker");
            ServiceInfoManager.NUMBER_RECORD_BREAKER_OPEN_TIME = TSUtility.getServerBaseNowUnixTime();

            // 显示加载进度
            PopupManager.Instance().showDisplayProgress(true);

            // // 获取RecordBreakerPopup实例并打开
            // RecordBreakerPopup.getPopup((error: boolean, popup: RecordBreakerPopup) => {
            //     PopupManager.Instance().showDisplayProgress(false);

            //     if (!error) {
            //         // 创建购买入口原因对象
            //         const purchaseReason = new PurchaseEntryReason(
            //             SDefine.P_ENTRYPOINT_INGAMEOFFER,
            //             false
            //         );
            //         // 打开RecordBreaker弹窗
            //         popup.open(purchaseReason, true);
            //         // 设置关闭回调：检查下一个弹窗
            //         popup.setCloseCallback(() => {
            //             PopupManager.Instance().checkNextOpenPopup();
            //         });
            //     }
            // });
        };

        return popupInfo;
    }

    /**
     * 关闭弹窗（取消定时器 + 设置状态 + 执行基类_close）
     */
    public close(): void {
        if (this.isStateClose()) return;

        // 取消所有定时器
        this.unscheduleAllCallbacks();
        // 设置弹窗状态为关闭
        this.setState(DialogState.Close);
        // 清理资源（基类方法）
        this.clear();
        // 执行基类_close方法（淡出动画，时长0.3秒）
        this._close(DialogBase.getFadeOutAction(0.3));
    }
}