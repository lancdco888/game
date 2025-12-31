// HRVServiceUtil.ts
const { ccclass } = cc._decorator;
import SDefine from "../global_utility/SDefine";
import IAPManager from "../NativeUtil/Purchase/IAPManager";
//import FacebookUtil from "../Network/FacebookUtil";
import PopupManager from "../manager/PopupManager";
import SoundManager from "../manager/SoundManager";
import TSUtility from "../global_utility/TSUtility";
import NativeUtil from "../global_utility/NativeUtil";
import { Utility } from "../global_utility/Utility";

/**
 * 全局核心业务工具类 (HRVServiceUtil)
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 核心职责：项目全局通用业务工具方法封装，无UI、纯逻辑层工具类
 * 核心功能：游戏重启/退出、多触摸控制、场景名称映射、账号站点获取、地区判断等
 * 被 CommonPopup.ts 核心调用 → 登录错误弹窗的【RETRY】按钮 调用本类 restartGame() 方法
 * 依赖所有核心类，是项目的「业务胶水层」核心工具类
 */
@ccclass
export default class HRVServiceUtil {
    // ===================== 全局静态初始化方法 =====================
    /**
     * 初始化工具类 - 注册多点触控回调方法
     * 项目启动时调用一次即可
     */
    public static init(): void {
        TSUtility.setSetMultiTouchCallback(HRVServiceUtil.setMultiTouch_HRV);
    }

    // ===================== 核心业务方法 - 游戏重启/退出 【高频调用】 =====================
    /**
     * 重启游戏 【核心方法】 CommonPopup 登录失败弹窗的重试按钮 核心调用
     * 适配多平台：FB网页/FB小游戏/原生移动端(iOS/安卓)，不同平台执行不同重启逻辑
     * 重启前清理FB缓存、销毁内购实例、停止音效、销毁音效管理器，避免内存泄漏
     */
    public static restartGame(): void {
        // 清除Facebook相关缓存数据
        // FacebookUtil.default.clear();

        // Facebook网页版 - 刷新页面并拼接参数
        if (Utility.isFacebookWeb()) {
            const baseUrl = TSUtility.getHrefBaseUrl() + "?hrv_source=refresh";
            window.location.href = baseUrl;
        } 
        // Facebook小游戏版 - 直接退出小游戏
        else if (Utility.isFacebookInstant()) {
            //FBInstant.quit();
        }
        // 原生移动端(iOS/安卓) - 完整游戏重启流程
        else if (Utility.isMobileGame()) {
            PopupManager.Instance().showDisplayProgress(true);

            // 非新版内购 且 内购已初始化 → 销毁内购实例 释放资源
            if (!SDefine.Mobile_IAP_Renewal && IAPManager.isInit()) {
                IAPManager.Instance().Destroy();
            }

            // 延迟0.1秒执行重启 - 等待弹窗关闭动画/资源清理完成
            PopupManager.Instance().scheduleOnce(() => {
                // 停止所有音效并销毁音效管理器 防止内存泄漏
                const soundMan = cc.director.getScene().getComponentInChildren(SoundManager);
                const audioSources = cc.director.getScene().getComponentsInChildren(cc.AudioSource);
                
                if (soundMan) {
                    cc.log("soundMan destroy");
                    for (let i = 0; i < audioSources.length; ++i) {
                        audioSources[i].stop();
                    }
                    soundMan.destroy();
                }
                
                // 执行游戏重启
                cc.game.restart();
            }, 0.1);
        }
    }

    /**
     * 退出游戏 【核心方法】 CommonPopup 登录失败弹窗的关闭按钮 核心调用
     * 适配多平台：原生移动端直接退出游戏、FB小游戏退出小游戏
     */
    public static endGame(): void {
        if (Utility.isMobileGame()) {
            cc.game.end();
        } else if (Utility.isFacebookInstant()) {
            //FBInstant.quit();
        }
    }

    // ===================== 场景名称映射工具方法 =====================
    /**
     * 根据游戏分区名称获取对应大厅场景名
     * @param param1 无用占位参数(原逻辑保留)
     * @param zoneName 分区名称 (SDefine 常量)
     * @returns 对应大厅场景名称
     */
    public static getLobbySceneName(param1: any, zoneName: string): string {
        if (zoneName === SDefine.HIGHROLLER_ZONENAME) {
            return SDefine.LOBBY_SCENE_HIGHROLLER_NAME;
        } else if (zoneName === SDefine.LIGHTNING_ZONENAME) {
            return SDefine.LOBBY_SCENE_LIGHTNING_NAME;
        } else if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
            return SDefine.LOBBY_SCENE_VIP_LOUNGE_NAME;
        } else if (zoneName === SDefine.SUITE_ZONENAME) {
            return SDefine.LOBBY_SCENE_SUITE_LOUNGE_NAME;
        }
        // 默认返回高辊大厅
        return SDefine.LOBBY_SCENE_HIGHROLLER_NAME;
    }

    /**
     * 重载方法 - 根据分区名称获取对应大厅场景名 (无占位参数)
     * @param zoneName 分区名称 (SDefine 常量)
     * @returns 对应大厅场景名称
     */
    public static getLobbySceneNameWithZoneName(zoneName: string): string {
        if (zoneName === SDefine.HIGHROLLER_ZONENAME) {
            return SDefine.LOBBY_SCENE_HIGHROLLER_NAME;
        } else if (zoneName === SDefine.LIGHTNING_ZONENAME) {
            return SDefine.LOBBY_SCENE_LIGHTNING_NAME;
        } else if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
            return SDefine.LOBBY_SCENE_VIP_LOUNGE_NAME;
        } else if (zoneName === SDefine.SUITE_ZONENAME) {
            return SDefine.LOBBY_SCENE_SUITE_LOUNGE_NAME;
        }
        // 默认返回高辊大厅
        return SDefine.LOBBY_SCENE_HIGHROLLER_NAME;
    }

    // ===================== 账号相关工具方法 =====================
    /**
     * 获取游客账号的站点标识
     * 区分iOS/安卓移动端，网页端返回unknown并报错
     * @returns 账号站点字符串 (SDefine 常量)
     */
    public static getGuestAccountSite(): string {
        if (Utility.isMobileGame()) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                return SDefine.AccSite_IOSGuest;
            } else {
                return SDefine.AccSite_AOSGuest;
            }
        } else {
            cc.error("getGuestAccountSite not supported");
            return "unknown";
        }
    }

    // ===================== 触控相关工具方法 =====================
    /**
     * 设置多点触控开关 【原生+网页双适配】
     * 移动端调用原生层设置，网页端调用Cocos引擎设置，带开关控制
     * @param enable 是否开启多点触控
     */
    public static setMultiTouch_HRV(enable: boolean): void {
        // 网页端 - 直接调用Cocos引擎API
        if (!Utility.isMobileGame()) {
            if (typeof cc.sys["setMultiTouch"] !== "undefined") {
                cc.sys["setMultiTouch"](enable);
            }
        } 
        // 移动端 - 调用原生层API + 引擎宏定义同步
        else {
            // 全局配置关闭多点触控 → 直接返回不执行
            if (!SDefine.Mobile_MultiTouch_OnOff) {
                return;
            }
            NativeUtil.setMultiTouch(enable?1:0);
            cc.macro.ENABLE_MULTI_TOUCH = enable;
        }
    }

    // ===================== 地区判断工具方法 =====================
    /**
     * 判断当前是否为日本地区
     * 通过Line的国家码判断，项目业务逻辑专属方法
     * @returns boolean true=日本地区 false=其他地区
     */
    public static isJapan(): boolean {
        return NativeUtil.getCountryCode_Line() === "JP";
    }
}
