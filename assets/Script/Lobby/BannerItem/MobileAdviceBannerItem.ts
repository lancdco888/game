import CommonBannerItem from "../../BannerItem/CommonBannerItem";
import GameCommonSound from "../../GameCommonSound";
import PopupManager from "../../manager/PopupManager";

const { ccclass } = cc._decorator;


/**
 * 移动端安装建议横幅组件
 * 继承自通用横幅基类，处理安装建议横幅的点击事件（播放音效+打开安装建议弹窗）
 */
@ccclass()
export default class MobileAdviceBannerItem extends CommonBannerItem {
    /**
     * 按钮点击事件处理
     * 1. 播放通用按钮音效
     * 2. 显示加载进度，异步获取并打开移动端安装建议弹窗
     */
    public onClickBtn(): void {
        // 播放"btn_etc"音效（一次）
        GameCommonSound.playFxOnce("btn_etc");

        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(false);

        // // 异步获取移动端安装建议弹窗实例
        // MobileInstallAdvicePopup.default.getPopup((err: Error | null | undefined, popup: MobileInstallAdvicePopup) => {
        //     // 隐藏加载进度
        //     PopupManager.Instance().showDisplayProgress(false);
            
        //     // 无错误则打开弹窗（原代码e || t.open() 等价于 !err && popup.open()）
        //     if (!err && popup) {
        //         popup.open();
        //     }
        // });
    }
}