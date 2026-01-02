const { ccclass, property } = cc._decorator;

// 导入所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import SoundManager from "../manager/SoundManager";
import GameCommonSound from "../GameCommonSound";
import UserInfo from "../User/UserInfo";
import UserPromotion, { HeroBuffPromotion } from "../User/UserPromotion";
import { Utility } from "../global_utility/Utility";
import HeroMainPopup, { TypeHeroSubPopup } from "./HeroMainPopup";

@ccclass
export default class HeroBuff extends DialogBase {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，直接拖拽绑定) ======================
    @property(cc.Button)
    private btnOK: cc.Button = null;

    @property(cc.Label)
    private labelRemainTime: cc.Label = null;

    @property(cc.Node)
    private bg: cc.Node = null;

    // ====================== 私有成员变量 ======================
    private _entryPoint: boolean = false;

    // ====================== 静态公共方法 - 动态加载弹窗预制体 (全局调用核心入口) ======================
    public static getPopup(callback: (err: Error, popup: HeroBuff) => void): void {
        if (callback) PopupManager.Instance().showDisplayProgress(true);
        const resPath = "Service/01_Offer/HeroBuff/Popup_HeroBuff";

        cc.loader.loadRes(resPath, (err, prefab) => {
            if (callback) PopupManager.Instance().showDisplayProgress(false);

            // 加载失败：异常日志上报 + 回调错误信息
            if (err) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback && callback(error, null);
                return;
            }

            // 加载成功：实例化预制体 + 获取组件实例
            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(HeroBuff);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    // ====================== 生命周期回调 ======================
    protected onLoad(): void {
        this.initDailogBase();
        // 设置弹窗遮罩层为画布全屏尺寸
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        this.bg.setContentSize(canvasNode.getContentSize());
    }

    // ====================== 重写父类核心方法 - 弹窗打开 ======================
    /**
     * 打开英雄Buff弹窗
     * @param entryPoint 弹窗打开的入口标记
     * @returns 当前弹窗实例 (链式调用)
     */
    public open(entryPoint: boolean): HeroBuff {
        // 初始化刷新倒计时 + 每秒刷新一次
        this.refresh();
        this.schedule(this.refresh, 1);

        this._entryPoint = entryPoint;
        // 播放弹窗弹出音效
        GameCommonSound.playFxOnce("pop_etc");
        // 绑定确认按钮点击事件
        this.btnOK.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroBuff", "onClickOK", ""));
        // 执行父类弹窗打开逻辑
        this._open(null);

        // 原代码保留逻辑：重置关闭按钮交互状态 防止卡死
        this.closeBtn.interactable = false;
        this.closeBtn.interactable = true;

        return this;
    }

    // ====================== 重写父类核心方法 - 弹窗关闭 ======================
    public close(): void {
        // 播放按钮点击音效
        SoundManager.Instance() && GameCommonSound.playFxOnce("btn_etc");
        
        if (this.isStateClose()) return;
        // 清除所有定时器 防止内存泄漏
        this.unscheduleAllCallbacks();
        this.setState(DialogState.Close);
        this.clear();
        this._close(null); // 无关闭动画 直接关闭
    }

    // ====================== 按钮点击事件回调 ======================
    /**
     * 确认按钮点击 - 核心跳转逻辑
     * 根据是否有激活英雄，跳转不同的英雄子弹窗
     */
    public onClickOK(): void {
        const self = this;
        // 判断当前用户是否拥有激活英雄
        const hasActiveHero = UserInfo.instance().getUserHeroInfo().hasActiveHero();
        // 选择对应弹窗打开类型
        const popupType = hasActiveHero ? TypeHeroSubPopup.activeHeroPopup : TypeHeroSubPopup.infoPopup;

        // 加载英雄主弹窗并打开
        HeroMainPopup.getPopup((err, popup) => {
            if (err) {
                self.close();
            } else {
                self.node.active = false;
                // 打开主弹窗并设置关闭回调：关闭当前Buff弹窗
                popup.open(popupType).setCloseCallback(() => {
                    self.close();
                });
            }
        });
    }

    // ====================== 核心业务方法 ======================
    /**
     * 每秒刷新倒计时 - 核心方法
     * 获取英雄Buff剩余时长、格式化时间文本、超时自动关闭弹窗
     */
    private refresh(): void {
        // 获取英雄Buff的剩余有效时间(秒)
        const remainTime = UserInfo.instance()
            .getPromotionInfo(HeroBuffPromotion.PromotionKeyName)
            .getRemainTime();

        // 格式化时间文本并赋值，强制转大写 与原UI一致
        if (TSUtility.isValid(this.labelRemainTime)) {
            this.labelRemainTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormat(remainTime).toUpperCase();
        }

        // 剩余时间<=0 自动关闭弹窗
        if (remainTime <= 0) {
            this.unscheduleAllCallbacks();
            this.onClickClose();
        }
    }
}