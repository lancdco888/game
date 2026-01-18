import CommonBannerItem from "../../BannerItem/CommonBannerItem";
import GameCommonSound from "../../GameCommonSound";
import SDefine from "../../global_utility/SDefine";
import { Utility } from "../../global_utility/Utility";
import PopupManager from "../../manager/PopupManager";

const { ccclass } = cc._decorator;

/**
 * Facebook点赞（关注）横幅组件
 * 继承自通用横幅基类，处理点赞横幅的点击事件（环境区分+FB关注/URL跳转）
 */
@ccclass('FBLikeBannerItem')
export default class FBLikeBannerItem extends CommonBannerItem {
    /**
     * 按钮点击事件处理
     * 1. 播放通用按钮音效
     * 2. Facebook Instant环境：调用FB官方页关注API；普通环境：打开FB粉丝页URL
     */
    public onClickBtn(): void {
        // 播放"btn_etc"音效（一次）
        GameCommonSound.playFxOnce("btn_etc");

        // 判断是否为Facebook Instant环境
        if (Utility.isFacebookInstant()) {
            // 显示加载进度
            PopupManager.Instance().showDisplayProgress(true);

            // // 异步检查是否可关注官方页 → 可关注则执行关注操作
            // FBInstant.community.canFollowOfficialPageAsync()
            //     .then((canFollow: boolean) => {
            //         // 隐藏加载进度
            //         PopupManager.Instance().showDisplayProgress(false);
            //         // 可关注则触发关注操作
            //         if (canFollow) {
            //             FBInstant.community.followOfficialPageAsync();
            //         }
            //     });
        } else {
            // 普通环境：打开Facebook粉丝页URL
            cc.sys.openURL(SDefine.FACEBOOK_FANPAGE_URL);
        }
    }
}