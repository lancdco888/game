import DialogBase, { DialogState } from "./DialogBase";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import GameCommonSound from "./GameCommonSound";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import CommonServer from "./Network/CommonServer";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";
import TSUtility from "./global_utility/TSUtility";
import TimeFormatHelper from "./global_utility/TimeFormatHelper";
import { Utility } from "./global_utility/Utility";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;


/**
 * 删除账号取消弹窗组件
 * 负责显示账号注销倒计时、处理取消注销请求、根据倒计时状态切换显示节点、弹窗关闭/平台适配的游戏重启逻辑
 */
@ccclass()
export default class DeleteAccount_Cancle_Popoup extends DialogBase {
    // ===== 组件属性（绑定到编辑器）=====
    @property(cc.Label)
    private remain_Label!: cc.Label; // 剩余时间显示标签

    @property(cc.Button)
    private ok_Btn!: cc.Button; // 确认取消注销按钮

    @property(cc.Button)
    private cancle_Btn!: cc.Button; // 取消按钮

    @property(cc.Label)
    private day_Label!: cc.Label; // 天数单位标签

    @property(cc.Node)
    private normal_Node!: cc.Node; // 正常倒计时节点

    @property(cc.Node)
    private under_Node!: cc.Node; // 倒计时结束节点

    @property(cc.Button)
    private under_Ok_Btn!: cc.Button; // 倒计时结束后的确认按钮

    @property(cc.Label)
    private uid_Label!: cc.Label; // UID显示标签

    // ===== 静态常量 =====
    private static readonly POPUP_RES_PATH = "Service/01_System/Option/Account_Cancel"; // 弹窗预制体路径

    // ===== 静态方法 =====
    /**
     * 获取弹窗实例（异步加载预制体）
     * @param callback 加载完成回调 (error, popup实例)
     */
    public static getPopup(callback: (error: Error | null, popup: DeleteAccount_Cancle_Popoup | null) => void): void {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 加载弹窗预制体
        cc.loader.loadRes(DeleteAccount_Cancle_Popoup.POPUP_RES_PATH, (error: Error | null, asset: cc.Prefab) => {
            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);

            // 加载失败：上报异常并执行回调
            if (error) {
                const errorObj = new Error(
                    `cc.loader.loadRes fail ${DeleteAccount_Cancle_Popoup.POPUP_RES_PATH}: ${JSON.stringify(error)}`
                );
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecord(FHLogType.Exception, errorObj)
                );
                callback(error, null);
                return;
            }

            // 加载成功：实例化预制体并获取组件
            const popupNode = cc.instantiate(asset);
            const popupComponent = popupNode.getComponent(DeleteAccount_Cancle_Popoup);
            popupNode.active = false; // 初始隐藏
            callback(null, popupComponent);
        });
    }

    // ===== 生命周期方法 =====
    /**
     * 组件加载时初始化
     */
    protected onLoad(): void {
        // 初始化DialogBase基类
        this.initDailogBase();

        // 绑定按钮点击事件（非空判断避免空指针）
        this._bindButtonEvents();
    }

    // ===== 私有方法 =====
    /**
     * 绑定按钮点击事件
     */
    private _bindButtonEvents(): void {
        // 确认取消注销按钮 → 触发onClickOK
        if (this.ok_Btn) {
            this.ok_Btn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "DeleteAccount_Cancle_Popoup", "onClickOK", "")
            );
        }

        // 取消按钮 → 触发close
        if (this.cancle_Btn) {
            this.cancle_Btn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "DeleteAccount_Cancle_Popoup", "close", "")
            );
        }

        // 倒计时结束后的确认按钮 → 触发close
        if (this.under_Ok_Btn) {
            this.under_Ok_Btn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "DeleteAccount_Cancle_Popoup", "close", "")
            );
        }
    }

    /**
     * 更新剩余注销倒计时显示
     */
    private updateRemainTime(): void {
        // 计算剩余时间（账号删除日期 - 服务器当前时间）
        const remainTime = ServiceInfoManager.NUMBER_ACCOUNT_DELETE_DATE - TSUtility.getServerBaseNowUnixTime();
        const timeFormatter = new TimeFormatHelper(remainTime);
        
        // 剩余天数大于0 → 显示天数
        const totalDays = timeFormatter.getTotDay();
        if (totalDays > 0) {
            this.day_Label.string = "Days";
            this.remain_Label.string = (totalDays + 1).toString();
            this.day_Label.node.active = true;
        } 
        // 剩余时间小于等于0天 → 显示时分秒
        else {
            this.remain_Label.string = timeFormatter.getHourTimeString();
            this.day_Label.node.active = false;

            // 剩余时间≤0 → 禁用确认按钮
            if (remainTime <= 0) {
                this.ok_Btn.interactable = false;
            }
        }
    }

    /**
     * 设置UID显示
     */
    private setUID(): void {
        const uid = UserInfo.instance().getUid();
        this.uid_Label.string = `UID : ${uid.toString()}`;
    }

    // ===== 公共方法 =====
    /**
     * 打开弹窗（初始化倒计时显示）
     * @returns 弹窗实例（链式调用）
     */
    public open(): DeleteAccount_Cancle_Popoup {
        // 播放弹窗音效
        GameCommonSound.playFxOnce("pop_etc");

        // 初始化节点状态
        this.normal_Node.active = false;
        this.under_Node.active = false;

        // 计算剩余注销倒计时（秒）
        const remainTime = ServiceInfoManager.NUMBER_ACCOUNT_DELETE_DATE - TSUtility.getServerBaseNowUnixTime();
        
        if (remainTime > 0) {
            const timeFormatter = new TimeFormatHelper(remainTime);
            const totalDays = timeFormatter.getTotDay();

            // 剩余天数>0 → 显示正常节点，每秒更新倒计时
            if (totalDays > 0) {
                this.day_Label.string = "Days";
                this.remain_Label.string = (totalDays + 1).toString();
                this.normal_Node.active = true;
                this.updateRemainTime();
                this.schedule(() => this.updateRemainTime(), 1);
            } 
            // 剩余天数≤0 → 显示时分秒
            else {
                this.remain_Label.string = timeFormatter.getHourTimeString();
                this.day_Label.node.active = false;

                // 剩余时间>10秒 → 显示正常节点，每秒更新
                if (remainTime > 10) {
                    this.normal_Node.active = true;
                    this.updateRemainTime();
                    this.schedule(() => this.updateRemainTime(), 1);
                } 
                // 剩余时间≤10秒 → 显示倒计时结束节点，展示UID
                else {
                    this.under_Node.active = true;
                    this.setUID();
                }
            }
        } 
        // 剩余时间≤0 → 直接显示倒计时结束节点，展示UID
        else {
            this.under_Node.active = true;
            this.setUID();
        }

        // 执行基类打开逻辑（无动画）
        this._open(null);
        return this;
    }

    /**
     * 点击确认取消注销按钮回调
     */
    public onClickOK(): void {
        // 请求取消账号注销
        CommonServer.Instance().requestSecessionCancle((response: any) => {
            // 服务器响应无错误 → 重启游戏
            if (!CommonServer.isServerResponseError(response)) {
                HRVServiceUtil.restartGame();
            }
        });
    }

    /**
     * 关闭弹窗（清理调度器+平台适配的游戏重启/结束）
     */
    public close(): void {
        // 清理所有倒计时调度器
        this.unscheduleAllCallbacks();

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 避免重复关闭
        if (this.isStateClose()) return;

        // 设置弹窗状态为关闭
        this.setState(DialogState.Close);
        
        // 清理资源/状态
        this.clear();

        // 执行基类关闭逻辑（无动画）
        this._close(null);

        // 平台适配：Facebook Web → 重启游戏；其他 → 结束游戏
        if (Utility.isFacebookWeb() ){
            HRVServiceUtil.restartGame();
        } else {
            TSUtility.endGame();
        }
    }
}