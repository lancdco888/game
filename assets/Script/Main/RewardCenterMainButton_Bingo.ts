const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import CommonServer from "../Network/CommonServer";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import UserPromotion, { DailyBingoBallPromotion } from "../User/UserPromotion";
import BingoPopup from "../Bingo/BingoPopup";
import RewardCenterPopup from "../Popup/RewardCenterPopup";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";
import { Utility } from "../global_utility/Utility";

/**
 * 奖励中心 - Bingo福利按钮 子类
 * 继承RewardCenterMainButton基类，实现宾果游戏专属的领取/游玩逻辑
 */
@ccclass
export default class RewardCenterMainButton_Bingo extends RewardCenterMainButton {
    // ===================== 序列化绑定节点组件 与原文件完全一致 补全@property注解 =====================
    @property(cc.Button)
    public btnCollect: cc.Button = null;

    @property(cc.Button)
    public btnPlayNow: cc.Button = null;

    @property(cc.Node)
    public mainPopupNode: cc.Node = null;

    // ===================== 重写父类方法 - 返回当前按钮类型 固定为BINGO =====================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.BINGO;
    }

    // ===================== 静态公有方法 - 供主视图调用统计红点 原逻辑完整保留 必须static =====================
    public static isCanReceive(): boolean {
        if (!RewardCenterMainButton_Bingo.isUseable()) return false;
        const promotionInfo = UserInfo.instance().getPromotionInfo(DailyBingoBallPromotion.PromotionKeyName);
        const currentServerTime = TSUtility.getServerBaseNowUnixTime();
        return promotionInfo.nextReceiveTime < currentServerTime;
    }

    // ===================== 静态公有方法 - 供主视图调用判断按钮是否可用 固定返回true =====================
    public static isUseable(): boolean {
        return true;
    }

    // ==============================================================
    // ✅ 重写父类protected核心方法 完整实现Bingo按钮的业务逻辑
    // 所有方法访问修饰符为protected 完全符合父类设计规范
    // ==============================================================
    /** 重写初始化：绑定按钮点击事件 */
    protected _initialize(): void {
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_Bingo", "onClick_Collect", ""));
        this.btnPlayNow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_Bingo", "onClick_PlayNow", ""));
    }

    /** 重写UI更新：取消所有定时器+刷新UI+每5秒轮询刷新状态 */
    protected _updateUI(): void {
        this.unscheduleAllCallbacks();
        this.refreshUI();
        this.schedule(this.refreshUI, 5);
    }

    /** 重写可领取判断：调用自身静态方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_Bingo.isCanReceive();
    }

    /** 重写可用判断：调用自身静态方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_Bingo.isUseable();
    }

    // ==============================================================
    // ✅ 实例核心方法 与原JS逻辑一字不差 完整保留所有细节
    // ==============================================================
    /** 刷新按钮核心UI：可领取则显示领取按钮，否则显示立即游玩按钮 */
    public refreshUI(): void {
        this.btnCollect.node.active = this._isCanReceive();
        this.btnPlayNow.node.active = !this._isCanReceive();
    }

    /** 领取按钮点击回调 - 核心领取逻辑 完整保留所有校验+接口请求+弹窗交互+状态恢复 */
    public onClick_Collect(): void {
        const self = this;
        if (this._isUseable()) {
            if (this._isCanReceive()) {
                // 禁用按钮防止重复点击
                this.btnCollect.interactable = false;
                // 显示加载进度
                PopupManager.Instance().showDisplayProgress(true);
                // 请求服务器领取奖励
                CommonServer.Instance().requestAcceptPromotion(
                    UserInfo.instance().getUid(),
                    UserInfo.instance().getAccessToken(),
                    DailyBingoBallPromotion.PromotionKeyName,
                    0, 0, "",
                    (response: any) => {
                        PopupManager.Instance().showDisplayProgress(false);
                        // 接口请求失败：恢复按钮可点击
                        if (CommonServer.isServerResponseError(response)) {
                            self.btnCollect.interactable = true;
                        } else {
                            // 播放领取音效
                            GameCommonSound.playFxOnce("button_dailybingoball");
                            // 判断是否需要打开Bingo弹窗
                            if (!ServiceInfoManager.instance.getBingoPopupOpen()) {
                                BingoPopup.openPopup(
                                    UserInfo.instance().getServerChangeResult(response),
                                    () => {},
                                    () => {
                                        self.btnCollect.interactable = true;
                                        self.updateView(); // 派发全局刷新消息
                                    }
                                );
                            } else {
                                // Bingo弹窗已打开：关闭奖励中心弹窗
                                if (self.mainPopupNode != null) {
                                    self.mainPopupNode.getComponent(RewardCenterPopup).close();
                                }
                            }
                        }
                    }
                );
            } else {
                this.refreshUI();
            }
        } else {
            this.updateView();
        }
    }

    /** 立即游玩按钮点击回调 - 核心游玩逻辑 完整保留所有校验+接口请求+弹窗交互+状态恢复 */
    public onClick_PlayNow(): void {
        const self = this;
        if (this._isUseable()) {
            this.btnPlayNow.interactable = false;
            GameCommonSound.playFxOnce("btn_etc");

            if (!ServiceInfoManager.instance.getBingoPopupOpen()) {
                const promotionInfo = UserInfo.instance().getPromotionInfo(DailyBingoBallPromotion.PromotionKeyName);
                const nextReceiveTime = (promotionInfo == null ? TSUtility.getServerBaseNowUnixTime() + 300 : promotionInfo.nextReceiveTime);
                const currentServerTime = TSUtility.getServerBaseNowUnixTime();

                // 时间已到：先领取再打开弹窗
                if (nextReceiveTime < currentServerTime) {
                    CommonServer.Instance().requestAcceptPromotion(
                        UserInfo.instance().getUid(),
                        UserInfo.instance().getAccessToken(),
                        DailyBingoBallPromotion.PromotionKeyName,
                        0, 0, "",
                        (response: any) => {
                            PopupManager.Instance().showDisplayProgress(false);
                            if (CommonServer.isServerResponseError(response)) {
                                self.btnPlayNow.interactable = true;
                            } else {
                                BingoPopup.openPopup(
                                    UserInfo.instance().getServerChangeResult(response),
                                    () => {},
                                    () => {
                                        self.updateView();
                                        self.btnPlayNow.interactable = true;
                                    }
                                );
                            }
                        }
                    );
                } else {
                    // 时间未到：直接打开弹窗
                    BingoPopup.openPopup(
                        null,
                        () => {},
                        () => {
                            self.updateView();
                            self.btnPlayNow.interactable = true;
                        }
                    );
                }
            } else {
                // Bingo弹窗已打开：关闭奖励中心弹窗
                if (self.mainPopupNode != null) {
                    self.mainPopupNode.getComponent(RewardCenterPopup).close();
                }
            }
        } else {
            this.updateView();
        }
    }
}