import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import AstonishingPopup from "./AstonishingPopup";
import PopupManager, { OpenPopupInfo } from "./PopupManager";

const { ccclass, property } = cc._decorator;



/**
 * 服务弹窗管理器（单例）
 * 负责新纪录弹窗的预约、显示条件判断、弹窗回调处理等逻辑
 */
@ccclass()
export default class ServicePopupManager {
    // 单例实例
    private static _instance: ServicePopupManager = null;

    /**
     * 获取单例实例（懒加载初始化）
     * @returns ServicePopupManager单例
     */
    public static instance(): ServicePopupManager {
        if (!ServicePopupManager._instance) {
            ServicePopupManager._instance = new ServicePopupManager();
            ServicePopupManager._instance.initManager();
        }
        return ServicePopupManager._instance;
    }

    /**
     * 初始化管理器（空方法，保留原逻辑扩展点）
     */
    public initManager(): void {
        // 原JS中空实现，保留作为扩展点
    }

    /**
     * 预约新纪录弹窗（判断显示条件并添加到弹窗管理器）
     * @param winCoin 本次赢取的金币金额
     * @returns 是否成功预约弹窗（true=预约成功，false=不满足条件）
     */
    public reserveNewRecordPopup(winCoin: number): boolean {
        // 1. 设置用户最大赢币记录
        UserInfo.instance().setBiggestWinCoin(winCoin);

        // 2. 判断弹窗显示条件（任一条件满足则不显示弹窗）
        const isLevelLimit = UserInfo.instance().getUserLevel() <= 10; // 等级≤10
        const isPlusBonus = ServiceInfoManager.BOOL_PLUS_BONUS; // 加奖金标记
        const isIOSShopFlag = SDefine.FB_Instant_iOS_Shop_Flag; // iOS FB小游戏商店标记
        const isShowRecordDisabled = !UserInfo.instance().isShowRecordRenewal(); // 禁用新纪录显示
        const isCoinTooSmall = winCoin < 300000; // 赢币<30万

        if (isLevelLimit || isPlusBonus || isIOSShopFlag || isShowRecordDisabled || isCoinTooSmall) {
            // 不满足显示条件：重置加奖金标记，返回false
            ServiceInfoManager.BOOL_PLUS_BONUS = false;
            return false;
        }

        // 3. 满足显示条件：创建弹窗打开信息
        const popupInfo = new OpenPopupInfo();
        popupInfo.type = "NewRecord";
        popupInfo.openCallback = (): void => {
            // 显示弹窗加载进度
            PopupManager.Instance().showDisplayProgress(true);

            // 获取AstonishingPopup实例并打开
            AstonishingPopup.getPopup((error: Error, popup: AstonishingPopup) => {
                // 隐藏加载进度
                PopupManager.Instance().showDisplayProgress(false);

                if (!error) {
                    // 打开弹窗：传入当前最大赢币、上一次最大赢币
                    popup.open(
                        UserInfo.instance().getBiggestWinCoin(),
                        UserInfo.instance().getPrevBiggestWinCoin()
                    );
                    // 设置弹窗关闭回调：检查下一个待打开的弹窗
                    popup.setCloseCallback(() => {
                        PopupManager.Instance().checkNextOpenPopup();
                    });
                }
            });
        };

        // 4. 将弹窗添加到PopupManager，重置新纪录标记，返回true
        PopupManager.Instance().addOpenPopup(popupInfo);
        UserInfo.instance().resetRecordRenewalFlag();
        return true;
    }
}