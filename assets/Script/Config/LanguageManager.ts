// LanguageManager.ts
const { ccclass } = cc._decorator;
import FireHoseSender, { FHLogType } from "../FireHoseSender";

/**
 * 多语言文本数据模型
 * 存储单条文本的 英文/日文/中文 翻译内容
 */
export class LanguageInfo {
    public stringInfo: { [lang: string]: string } = {}; // EN/JP/CN 对应文本
}

/**
 * 全局多语言管理核心类 (LanguageManager)
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 核心职责：项目全局多语言配置加载、文本翻译获取、统一语言包管理
 * 被 CommonPopup.ts 核心调用 - 弹窗的标题/内容多语言适配
 * 特点：单例模式、默认英文(EN)、无对应翻译则返回原文本ID、加载失败上报异常日志
 */
@ccclass
export default class LanguageManager {

    // ===================== 成员核心属性 =====================
    private _commonInfo: { [id: string]: LanguageInfo } = {};    // 通用多语言文本库 (弹窗/按钮等公共文本)
    private _inboxInfo: { [id: string]: LanguageInfo } = {};     // 收件箱多语言文本库
    private _languageList: string[] = ["EN", "JP", "CN"];        // 支持的语言列表 【默认优先使用 EN 英文】

    // ===================== 全局单例方法 - 核心入口 =====================
    /**
     * 获取单例实例 (必须先调用 Init 初始化，否则报错)
     */
    public static Instance(): LanguageManager {
        if (!LanguageManager._instance) {
            cc.error("LanguageManager not initialized");
        }
        return LanguageManager._instance;
    }

    /**
     * 初始化多语言管理器 (全局唯一初始化入口)
     * @param langConfig 多语言配置JSON数据
     * @returns boolean 初始化状态
     */
    public static Init(langConfig: any): boolean {
        LanguageManager._instance = new LanguageManager();
        LanguageManager._instance.initLanguageManager(langConfig);
        return true;
    }

    // ===================== 静态核心方法 - 异步加载语言配置文件 =====================
    /**
     * 【注意：原代码拼写错误保留 aync 而非 async，请勿修改！】
     * 异步加载多语言JSON配置资源
     * 加载失败会自动上报AWS异常日志，加载成功返回JSON数据
     * @param resPath 配置文件资源路径
     * @returns Promise<any> 配置JSON数据/null
     */
    public static async ayncLoadConfig(resPath: string): Promise<any> {
        return new Promise((resolve) => {
            cc.loader.loadRes(resPath, cc.JsonAsset, (err, jsonAsset) => {
                if (err) {
                    // 加载失败 - 创建异常信息并上报FireHose日志
                    const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                    FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                    resolve(null);
                    return;
                }
                // 加载成功 - 返回JSON配置内容
                resolve(jsonAsset.json);
            });
        });
    }

    // ===================== 实例核心方法 =====================
    /**
     * 解析多语言配置数据，初始化文本库
     * 配置分两大模块：Inbox(收件箱) + common(通用文本)
     * @param langConfig 多语言配置JSON数据
     */
    private initLanguageManager(langConfig: any): void {
        // 初始化 收件箱 多语言文本
        const inboxData = langConfig.Inbox;
        if (inboxData && inboxData.length > 0) {
            for (let i = 0; i < inboxData.length; ++i) {
                const item = inboxData[i];
                this._inboxInfo[item.id] = new LanguageInfo();
                this._inboxInfo[item.id].stringInfo.JP = item.JP;
                this._inboxInfo[item.id].stringInfo.CN = item.CN;
                this._inboxInfo[item.id].stringInfo.EN = item.EN;
            }
        }

        // 初始化 通用 多语言文本 (弹窗/按钮等核心文本)
        const commonData = langConfig.common;
        if (commonData && commonData.length > 0) {
            for (let i = 0; i < commonData.length; ++i) {
                const item = commonData[i];
                this._commonInfo[item.id] = new LanguageInfo();
                this._commonInfo[item.id].stringInfo.JP = item.JP;
                this._commonInfo[item.id].stringInfo.CN = item.CN;
                this._commonInfo[item.id].stringInfo.EN = item.EN;
            }
        }
    }

    /**
     * 获取收件箱的多语言文本
     * @param textId 文本唯一标识ID
     * @returns string 翻译后的文本 / 无翻译则返回原ID
     */
    public getInboxText(textId: string): string {
        const defaultLang = this._languageList[0]; // 默认使用英文 EN
        if (this._inboxInfo[textId] && this._inboxInfo[textId].stringInfo[defaultLang]) {
            return this._inboxInfo[textId].stringInfo[defaultLang];
        }
        return textId;
    }

    /**
     * 获取通用多语言文本 【核心方法】
     * CommonPopup.ts 弹窗的标题/内容文本 核心调用此方法
     * @param textId 文本唯一标识ID
     * @returns string 翻译后的文本 / 无翻译则返回原ID
     */
    public getCommonText(textId: string): string {
        const defaultLang = this._languageList[0]; // 默认使用英文 EN
        if (this._commonInfo[textId] && this._commonInfo[textId].stringInfo[defaultLang]) {
            return this._commonInfo[textId].stringInfo[defaultLang];
        }
        return textId;
    }

    // ===================== 静态属性初始化 =====================
    public static _instance: LanguageManager = null;
}