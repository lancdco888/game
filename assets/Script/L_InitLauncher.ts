import { ProductConfig } from "./Config/ProductConfig";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import GameCommonSound from "./GameCommonSound";
import IAPManager from "./NativeUtil/Purchase/IAPManager";
import IAPManager_AOS from "./NativeUtil/Purchase/IAPManager_AOS";
import IAPManager_iOS from "./NativeUtil/Purchase/IAPManager_iOS";
import FBInstantUtil from "./Network/FBInstantUtil";
import CommonPopup from "./Popup/CommonPopup";
import State from "./Slot/State";
import SDefine from "./global_utility/SDefine";
import { Utility } from "./global_utility/Utility";
import ConfigManager from "./manager/ConfigManager";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";

const { ccclass, property } = cc._decorator;



/**
 * 启动器初始化状态类
 * 负责应用启动阶段的核心初始化逻辑：配置加载、音效初始化、推送/内购/FB Instant适配、埋点统计等
 */
@ccclass()
export default class L_InitLauncher extends State {
    /**
     * 启动初始化流程
     */
    public onStart(): void {
        this._done = false;
        this.doProcess();
    }

    /**
     * 初始化核心处理逻辑
     */
    public async doProcess(): Promise<void> {
        try {
            // 1. 初始化埋点（启动器初始化开始）
            //Analytics.default.initLauncherStart();

            // 2. 加载所有配置文件
            await ConfigManager.asyncLoadAllConfig();
            // if (configLoadResult) {
            //     // 配置加载失败：显示网络错误弹窗并终止流程
            //     CommonPopup.loginErrorPopup("Network Error.");
            //     return;
            // }

            // 3. 初始化服务端Slot数据管理器
            const slotDataInitResult = await ServiceSlotDataManager.instance.initialize();
            if (!slotDataInitResult) {
                // 数据初始化失败：显示网络错误弹窗并终止流程
                CommonPopup.loginErrorPopup("Network Error.");
                return;
            }

            // 4. 初始化游戏通用音效
            GameCommonSound.initGameCommonSound();

            // 5. 移动端特有初始化（推送+内购）
            if (Utility.isMobileGame()) {
                // 初始化App推送管理器
               // AppPushManager.default.Init();

                // 内购初始化（区分新旧版本逻辑）
                if (!SDefine.Mobile_IAP_Renewal) {
                    // 旧版内购：通用IAPManager
                    IAPManager.Init();
                } else {
                    // 新版内购：区分iOS/Android平台
                    if (cc.sys.os === cc.sys.OS_IOS) {
                        const iosProductIDs = ProductConfig.Instance().getProductIDs_iOS();
                        IAPManager_iOS.Instance().init(iosProductIDs);
                    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        const androidProductIDs = ProductConfig.Instance().getProductIDs_AOS();
                        IAPManager_AOS.Instance().init(androidProductIDs);
                    }
                }
            }

            // // 6. Facebook Instant Game特有初始化
            // if (Utility.isFacebookInstant()) {
            //     // 检查支付可用性
            //     FBInstantUtil.checkPaymentUseable();
            //     // 设置iOS商店标识
            //     SDefine.setFBInstant_IOS_Shop_Flag();
            // }

            // 7. 初始化完成埋点
            //Analytics.default.initLauncherComplete();
            
            // 8. 标记状态完成
            this.setDone();

        } catch (error) {
            // 全局异常捕获：上报到FireHose并标记状态完成
            // FireHoseSender.Instance().sendAws(
            //     FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            // );

            this.setDone();
        }
    }
}