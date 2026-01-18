import CommonBannerItem from "../../BannerItem/CommonBannerItem";
import GameCommonSound from "../../GameCommonSound";

const { ccclass } = cc._decorator;



/**
 * VIP横幅组件
 * 继承自通用横幅基类，处理VIP横幅的点击事件（播放音效+打开VIP信息弹窗）
 */
@ccclass()
export default class VipBannerItem extends CommonBannerItem {
    constructor(){
        super()
    }

    /**
     * 按钮点击事件处理
     * 1. 播放通用按钮音效
     * 2. 获取VIP信息弹窗实例并打开
     */
    public onClickBtn(): void {
        // 播放"btn_etc"音效（一次）
        GameCommonSound.playFxOnce("btn_etc");
        
        // // 异步获取VIP信息弹窗，成功则打开
        // VipInfoPopup.getVipInfoPopup((error: boolean | null, popup: VipInfoPopup) => {
        //     // 无错误则打开弹窗
        //     if (!error && popup) {
        //         popup.open();
        //     }
        // });
    }
}