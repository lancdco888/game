// TextUtil.ts
/**
 * 全局核心文本工具类 (纯逻辑 无节点依赖)
 * 核心能力：中日韩Unicode字符判断、空白符判断、文本宽度安全测量、智能文本分段切割(中英文混排自动换行核心)
 * 强依赖方：CustomRichText.ts 富文本组件，是富文本自动换行的底层算法支撑
 * 无任何序列化配置，全局实例化使用即可
 */
export default class TextUtil {
    //#region ====== 常量配置 ✅【原逻辑完整保留 含冗余赋值细节】 ======
    public BASELINE_RATIO: number = 0;
    public MIDDLE_RATIO: number = 0.5;
    //#endregion

    //#region ====== 核心正则表达式 ✅【原JS完整复刻 一字未改 重中之重】 ======
    // 英文/数字/特殊字母 单词匹配正则 → 按单词切割核心
    public label_wordRex: RegExp = /([a-zA-Z0-9\xc4\xd6\xdc\xe4\xf6\xfc\xdf\xe9\xe8\xe7\xe0\xf9\xea\xe2\xee\xf4\xfb\u0430-\u044f\u0410-\u042f\u0401\u0451]+|\S)/;
    // 标点符号匹配正则 → 禁止标点在行首显示
    public label_symbolRex: RegExp = /^[!,.:;'}\]%\?>\u3001\u2018\u201c\u300b\uff1f\u3002\uff0c\uff01]/;
    // 文本尾部单词匹配正则 → 单词切割兜底
    public label_lastWordRex: RegExp = /([a-zA-Z0-9\xc4\xd6\xdc\xe4\xf6\xfc\xdf\xe9\xe8\xe7\xe0\xf9\xea\xe2\xee\xf4\xfb\u0430\xed\xec\xcd\xcc\xef\xc1\xc0\xe1\xe0\xc9\xc8\xd2\xd3\xf2\xf3\u0150\u0151\xd9\xda\u0170\xfa\u0171\xf1\xd1\xe6\xc6\u0153\u0152\xc3\xc2\xe3\xd4\xf5\u011b\u0161\u010d\u0159\u017e\xfd\xe1\xed\xe9\xf3\xfa\u016f\u0165\u010f\u0148\u011a\u0160\u010c\u0158\u017d\xc1\xcd\xc9\xd3\xda\u0164\u017c\u017a\u015b\xf3\u0144\u0142\u0119\u0107\u0105\u017b\u0179\u015a\xd3\u0143\u0141\u0118\u0106\u0104-\u044f\u0410-\u042f\u0401\u0451]+|\S)$/;
    // 文本尾部英文匹配正则 → 英文单词换行处理
    public label_lastEnglish: RegExp = /[a-zA-Z0-9\xc4\xd6\xdc\xe4\xf6\xfc\xdf\xe9\xe8\xe7\xe0\xf9\xea\xe2\xee\xf4\xfb\u0430\xed\xcd\xcc\xef\xc1\xc0\xe1\xe0\xc9\xc8\xd2\xd3\xf2\xf3\u0150\u0151\xd9\xda\u0170\xfa\u0171\xf1\xd1\xe6\xc6\u0153\u0152\xc3\xc2\xe3\xd4\xf5\u011b\u0161\u010d\u0159\u017e\xfd\xe1\xed\xe9\xf3\xfa\u016f\u0165\u010f\u0148\u011a\u0160\u010c\u0158\u017d\xc1\xcd\xc9\xd3\xda\u0164\u017c\u017a\u015b\xf3\u0144\u0142\u0119\u0107\u0105\u017b\u0179\u015a\xd3\u0143\u0141\u0118\u0106\u0104-\u044f\u0410-\u042f\u0401\u0451]+$/;
    // 文本首部英文匹配正则 → 英文单词换行兜底
    public label_firstEnglish: RegExp = /^[a-zA-Z0-9\xc4\xd6\xdc\xe4\xf6\xfc\xdf\xe9\xe8\xe7\xe0\xf9\xea\xe2\xee\xf4\xfb\u0430\xed\xcd\xcc\xef\xc1\xc0\xe1\xe0\xc9\xc8\xd2\xd3\xf2\xf3\u0150\u0151\xd9\xda\u0170\xfa\u0171\xf1\xd1\xe6\xc6\u0153\u0152\xc3\xc2\xe3\xd4\xf5\u011b\u0161\u010d\u0159\u017e\xfd\xe1\xed\xe9\xf3\xfa\u016f\u0165\u010f\u0148\u011a\u0160\u010c\u0158\u017d\xc1\xcd\xc9\xd3\xda\u0164\u017c\u017a\u015b\xf3\u0144\u0142\u0119\u0107\u0105\u017b\u0179\u015a\xd3\u0143\u0141\u0118\u0106\u0104-\u044f\u0410-\u042f\u0401\u0451]/;
    // 文本首部表情匹配正则 → 表情符换行处理
    public label_firstEmoji: RegExp = /^[\uD83C\uDF00-\uDFFF\uDC00-\uDE4F]/;
    // 文本尾部表情匹配正则 → 表情符换行兜底
    public label_lastEmoji: RegExp = /([\uDF00-\uDFFF\uDC00-\uDE4F]+|\S)$/;
    // 换行检查开关 → 总控智能换行逻辑
    public label_wrapinspection: boolean = true;
    //#endregion

    //#region ====== 中日韩Unicode字符匹配正则 ✅【原逻辑完整复刻】 ======
    private __CHINESE_REG: RegExp = /^[\u4E00-\u9FFF\u3400-\u4DFF]+$/;
    private __JAPANESE_REG: RegExp = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;
    private __KOREAN_REG: RegExp = /^[\u1100-\u11FF]|[\u3130-\u318F]|[\uA960-\uA97F]|[\uAC00-\uD7AF]|[\uD7B0-\uD7FF]+$/;
    //#endregion

    //#region ====== 构造函数 ✅【原逻辑完整复刻 初始化常量】 ======
    constructor() {
        const o = 0;
        this.BASELINE_RATIO = o;
        this.MIDDLE_RATIO = (o + 1) / 2 - o;
    }
    //#endregion

    //#region ====== 公共核心方法 - Unicode字符判断【高频调用】 ======
    /**
     * 判断单个字符是否是中日韩unicode字符 (中文/日文/韩文)
     * @param char 待判断的单个字符
     * @returns boolean true=是中日韩字符 false=否
     */
    public isUnicodeCJK(char: string): boolean {
        return this.__CHINESE_REG.test(char) || this.__JAPANESE_REG.test(char) || this.__KOREAN_REG.test(char);
    }

    /**
     * 判断单个字符是否是空白符 (空格/制表符/换行符/全角空格等所有空白类型)
     * @param char 待判断的单个字符
     * @returns boolean true=是空白符 false=否
     */
    public isUnicodeSpace(char: string): boolean {
        const charCode = char.charCodeAt(0);
        return (charCode >= 9 && charCode <=13) || 
               charCode ===32 || charCode ===133 || charCode ===160 || charCode ===5760 ||
               (charCode >=8192 && charCode <=8202) || charCode ===8232 || charCode ===8233 ||
               charCode ===8239 || charCode ===8287 || charCode ===12288;
    }
    //#endregion

    //#region ====== 公共工具方法 - 文本宽度测量 ======
    /**
     * 安全测量文本宽度 - 兼容所有测量函数的返回值，防止空值报错
     * @param measureCtx 测量上下文(canvas/Label等)
     * @param text 待测量的文本
     * @returns number 文本宽度，异常则返回0
     */
    public safeMeasureText(measureCtx: { measureText: (text: string) => { width?: number } }, text: string): number {
        const measureResult = measureCtx.measureText(text);
        return measureResult && measureResult.width ? measureResult.width : 0;
    }
    //#endregion

    //#region ====== 核心算法 ✅【原逻辑1:1复刻 无任何修改 富文本自动换行的核心】 ======
    /**
     * 智能文本分段切割 - 中英文混排自动换行的核心算法
     * 处理规则：1.中文按字符换行 2.英文按单词换行 3.标点禁止行首 4.表情符单独处理 5.适配最大宽度
     * @param text 待切割的完整文本
     * @param textWidth 文本原始总宽度
     * @param maxWidth 允许的最大显示宽度
     * @param measureFunc 文本宽度测量函数 (由调用方传入，适配不同的文本渲染方式)
     * @returns string[] 切割后的文本片段数组，可直接分段渲染
     */
    public fragmentText(text: string, textWidth: number, maxWidth: number, measureFunc: (txt: string) => number): string[]|any {
        const fragments: string[] = [];
        // 边界值处理：空文本/最大宽度无效 → 返回空片段
        if (text.length === 0 || maxWidth < 0) {
            fragments.push("");
            return fragments;
        }

        let currentText = text;
        let currentWidth = textWidth;
        // 核心循环：文本宽度超过最大宽度 → 循环切割
        while (currentWidth > maxWidth && currentText.length > 1) {
            // 初始切割位置：按宽度比例估算，取整
            let cutPos = (currentText.length * (maxWidth / currentWidth)) | 0;
            let cutText = currentText.substring(cutPos);
            let remainWidth = currentWidth - measureFunc(cutText);
            let tempCutText = cutText;
            let stepLen = 0;
            let loopCount = 0;

            // 微调切割位置：宽度超限则缩小切割位 (最多循环10次 防止死循环)
            for (; remainWidth > maxWidth && loopCount++ < 10;) {
                cutPos = (cutPos * maxWidth / remainWidth) | 0;
                cutText = currentText.substring(cutPos);
                remainWidth = currentWidth - measureFunc(cutText);
            }

            loopCount = 0;
            // 微调切割位置：宽度合规则扩大切割位 (最多循环10次 防止死循环)
            for (; remainWidth <= maxWidth && loopCount++ <10;) {
                if (cutText) {
                    const wordMatch = this.label_wordRex.exec(cutText);
                    stepLen = wordMatch ? wordMatch[0].length : 1;
                    tempCutText = cutText;
                }
                cutPos += stepLen;
                cutText = currentText.substring(cutPos);
                remainWidth = currentWidth - measureFunc(cutText);
            }

            // 回退切割位：取合规的最大切割位置
            cutPos -= stepLen;
            if (cutPos === 0) {
                cutPos = 1;
                tempCutText = tempCutText.substring(1);
            }

            // 切割出当前行文本 + 剩余文本
            let matchResult: RegExpExecArray | null;
            let currentFragment = currentText.substring(0, cutPos);
            // 智能换行规则1：标点符号禁止在行首 → 把标点归到上一行
            if (this.label_wrapinspection && this.label_symbolRex.test(tempCutText || cutText)) {
                matchResult = this.label_lastWordRex.exec(currentFragment);
                const moveLen = matchResult ? matchResult[0].length : 0;
                cutPos -= moveLen;
                if (cutPos === 0) cutPos = 1;
                tempCutText = currentText.substring(cutPos);
                currentFragment = currentText.substring(0, cutPos);
            }

            // 智能换行规则2：表情符禁止被切割 → 完整表情归到下一行
            if (this.label_firstEmoji.test(tempCutText)) {
                matchResult = this.label_lastEmoji.exec(currentFragment);
                if (matchResult && currentFragment !== matchResult[0]) {
                    cutPos -= matchResult[0].length;
                    tempCutText = currentText.substring(cutPos);
                    currentFragment = currentText.substring(0, cutPos);
                }
            }

            // 智能换行规则3：英文单词禁止被切割 → 完整单词归到下一行
            if (this.label_firstEnglish.test(tempCutText)) {
                matchResult = this.label_lastEnglish.exec(currentFragment);
                if (matchResult && currentFragment !== matchResult[0]) {
                    cutPos -= matchResult[0].length;
                    tempCutText = currentText.substring(cutPos);
                    currentFragment = currentText.substring(0, cutPos);
                }
            }

            // 添加文本片段到数组：首行不做左侧去空格，其他行去左侧空格
            if (fragments.length === 0) {
                fragments.push(currentFragment);
            } else {
                const trimText = currentFragment.trimLeft();
                if (trimText.length > 0) fragments.push(trimText);
            }

            // 更新循环变量：剩余文本继续处理
            currentText = tempCutText || cutText;
            currentWidth = measureFunc(currentText);
        }

        // 处理最后一段文本：首行不做左侧去空格，其他行去左侧空格
        if (fragments.length === 0) {
            fragments.push(currentText);
        } else {
            const trimText = currentText.trimLeft();
            if (trimText.length >0) fragments.push(trimText);
        }

        return fragments;
    }
    //#endregion
}