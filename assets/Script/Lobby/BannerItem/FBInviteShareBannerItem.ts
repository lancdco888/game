import CommonBannerItem from "../../BannerItem/CommonBannerItem";
import GameCommonSound from "../../GameCommonSound";
import RewardCenterPopup from "../../Popup/RewardCenterPopup";
import { RewardCenterViewType } from "../../View/RewardCenterView";
import { Utility } from "../../global_utility/Utility";
import PopupManager from "../../manager/PopupManager";

const { ccclass } = cc._decorator;

/**
 * Facebook邀请分享横幅组件
 * 继承自通用横幅基类，处理分享横幅的点击事件（环境判断+打开奖励中心弹窗）
 */
@ccclass()
export default class FBInviteShareBannerItem extends CommonBannerItem {
    /**
     * 按钮点击事件处理
     * 1. 播放通用按钮音效
     * 2. 非Facebook Instant环境下，打开奖励中心弹窗（INBOX_SHARE类型）
     */
    public onClickBtn(): void {
        // 播放"btn_etc"音效（一次）
        GameCommonSound.playFxOnce("btn_etc");

        // 非Facebook Instant环境才执行弹窗逻辑
        if (!Utility.isFacebookInstant()) {
            // 显示加载进度
            PopupManager.Instance().showDisplayProgress(true);

            // 异步获取奖励中心弹窗实例
            RewardCenterPopup.getPopup((err: Error | null | undefined, popup: RewardCenterPopup) => {
                // 隐藏加载进度
                PopupManager.Instance().showDisplayProgress(false);
                
                // 无错误则打开弹窗（INBOX_SHARE类型）
                if (err == null && popup) {
                    popup.open(RewardCenterViewType.INBOX_SHARE);
                }
            });
        }
    }
}