import FireHoseSender, { FHLogType } from "../FireHoseSender";
import TSUtility from "../global_utility/TSUtility";

const { ccclass } = cc._decorator;

/**
 * 语言类型枚举
 * 覆盖所有支持的多语言类型
 */
export enum LangLocale {
    EN = "EN",  // 英语
    CN = "CN",  // 中文
    KR = "KR",  // 韩语
    ES = "ES",  // 西班牙语
    PT = "PT",  // 葡萄牙语
    RU = "RU"   // 俄语
}

/**
 * 本地化文本返回结果接口
 */
interface LocalizedTextResult {
    find: boolean; // 是否找到对应语言文本
    text: string;  // 文本内容（未找到则返回原key）
}

/**
 * 语言切换回调接口
 */
interface LocaleChangeHandler {
    onLocaleChanged: (newLocale: LangLocale, oldLocale: LangLocale) => void;
}

/**
 * 多语言管理单例类（LangLocaleManager）
 * 负责语言切换、本地化文本加载/获取、转义字符处理
 */
export default class LangLocaleManager {
    // ================= 单例相关 =================
    private static _instance: LangLocaleManager | null = null;

    /**
     * 获取单例实例
     * @returns LangLocaleManager实例
     */
    public static getInstance(): LangLocaleManager {
        if (!this._instance) {
            this._instance = new LangLocaleManager();
        }
        return this._instance;
    }

    // ================= 私有属性 =================
    private _locale: LangLocale = LangLocale.EN; // 当前语言（默认英语）
    private _changeHandlers: LocaleChangeHandler[] = []; // 语言切换回调列表
    private _localizedTextMap: Record<string, Record<LangLocale, string>> = {}; // 本地化文本映射表 {key: {EN: "text", CN: "文本"...}}
    private _stringToLangList: LangLocale[] = [LangLocale.EN, LangLocale.CN, LangLocale.KR, LangLocale.ES, LangLocale.PT, LangLocale.RU]; // 支持的语言列表

    // ================= 初始化与语言设置 =================
    /**
     * 初始化语言（从字符串转换为LangLocale枚举）
     * @param localeStr 语言字符串（如"EN"/"CN"）
     */
    public init(localeStr: string): void {
        this._locale = this.stringToLangLocale(localeStr);
    }

    /**
     * 将字符串转换为LangLocale枚举（无效值返回EN）
     * @param localeStr 语言字符串
     * @returns 标准化的LangLocale枚举值
     */
    public stringToLangLocale(localeStr: string): LangLocale {
        if (this._stringToLangList.includes(localeStr as LangLocale)) {
            return localeStr as LangLocale;
        } else {
            cc.error(`LangLocaleManager.stringToLangLocale: invalid locale ${localeStr}`);
            return LangLocale.EN;
        }
    }

    /**
     * 设置当前语言并触发切换回调
     * @param newLocale 新语言类型
     */
    public setLocale(newLocale: LangLocale): void {
        const oldLocale = this._locale;
        this._locale = newLocale;

        // 触发所有语言切换回调（检查回调对象有效性）
        this._changeHandlers.forEach(handler => {
            if (TSUtility.isValid(handler)) {
                handler.onLocaleChanged(newLocale, oldLocale);
            }
        });
    }

    /**
     * 获取当前语言
     * @returns 当前LangLocale枚举值
     */
    public getLocale(): LangLocale {
        return this._locale;
    }

    // ================= 回调管理 =================
    /**
     * 添加语言切换回调
     * @param handler 回调对象（需实现onLocaleChanged方法）
     */
    public addChangeHandler(handler: LocaleChangeHandler): void {
        if (this._changeHandlers.indexOf(handler) === -1) {
            this._changeHandlers.push(handler);
        }
    }

    /**
     * 移除语言切换回调
     * @param handler 要移除的回调对象
     */
    public removeChangeHandler(handler: LocaleChangeHandler): void {
        const index = this._changeHandlers.indexOf(handler);
        if (index !== -1) {
            this._changeHandlers.splice(index, 1);
        }
    }

    // ================= 本地化文本加载 =================
    /**
     * 加载本地化文本JSON资源
     * @param resPath JSON资源路径（相对于resources目录）
     * @returns Promise<void>
     */
    public async loadLocalizedText(resPath: string): Promise<void> {
        return new Promise((resolve) => {
            // 兼容Cocos 2.4.13的资源加载（loader.loadRes已废弃，可替换为resources.load）
            cc.loader.loadRes(resPath, cc.JsonAsset, (err, asset) => {
                if (err) {
                    // 加载失败：上报异常日志并resolve
                    const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                    FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg));
                    resolve();
                    return;
                }

                // 解析JSON并构建本地化文本映射表
                const jsonData = asset.json;
                if (jsonData && jsonData.common && Array.isArray(jsonData.common)) {
                    jsonData.common.forEach((item: any) => {
                        const textId = item.id;
                        const textMap: Record<LangLocale, string>|any = {};

                        // 遍历所有支持的语言，处理转义字符
                        this._stringToLangList.forEach(lang => {
                            let text = item[lang] || "";
                            textMap[lang] = this.replaceEscapedCharacters(text);
                        });

                        this._localizedTextMap[textId] = textMap;
                    });
                }

                resolve();
            });
        });
    }

    // ================= 文本处理 =================
    /**
     * 替换转义字符（\n/\t/\r）
     * @param str 原始字符串
     * @returns 处理后的字符串
     */
    public replaceEscapedCharacters(str: string): string {
        return str
            .replace(/\\n/g, "\n")  // 换行符
            .replace(/\\t/g, "\t")  // 制表符
            .replace(/\\r/g, "\r"); // 回车符
    }

    /**
     * 获取本地化文本（优先当前语言，兜底英文）
     * @param textId 文本ID
     * @returns LocalizedTextResult 文本结果
     */
    public getLocalizedText(textId: string): LocalizedTextResult {
        const textMap = this._localizedTextMap[textId];
        if (!textMap) {
            // 未找到文本ID，返回原ID
            return { find: false, text: textId };
        }

        // 优先当前语言 → 兜底英文 → 原ID
        let localizedText = textMap[this._locale];
        if (localizedText) {
            return { find: true, text: localizedText };
        } else if (textMap[LangLocale.EN]) {
            return { find: true, text: textMap[LangLocale.EN] };
        } else {
            return { find: false, text: textId };
        }
    }
}