const { ccclass } = cc._decorator;
/** 富文本样式类型枚举 - 与原JS完全一致 */
export enum CRichTextStyleType {
    FontBase = 0,  // 文本字体样式
    NodeBase = 1   // 节点/图片样式(图文混排)
}

/** 富文本解析结果单元 - 注意：保留原代码的拼写错误 CRithTextFormat 不可修改！ */
export class CRithTextFormat {
    public text: string = "";
    public style: CRichTextStyle | null = null;

    public isEqual(other: CRithTextFormat): boolean {
        return this.text === other.text && 
               this.style !== null && 
               other.style !== null && 
               this.style.isEqual(other.style);
    }
}

/** 样式基类 - 所有样式的父类 */
export class CRichTextStyle {
    public type: CRichTextStyleType = 0;

    public isEqual(other: CRichTextStyle): boolean {
        return this.type === other.type;
    }

    public isStackable(): boolean {
        return false;
    }
}

/** 文本基础样式类 - 继承样式基类 */
export class CFontBaseStyle extends CRichTextStyle {
    public type: CRichTextStyleType = CRichTextStyleType.FontBase;
    public fntName?: string;
    public size?: number;
    public italic?: boolean;
    public color?: string;
    public isNewLine?: boolean;
    public yOffset?: number;

    constructor() {
        super();
        this.type = CRichTextStyleType.FontBase;
    }

    public isStackable(): boolean {
        return !this.isValid(this.isNewLine) || !this.isNewLine;
    }

    public isEqual(other: CFontBaseStyle): boolean {
        return super.isEqual(other) &&
               this.fntName === other.fntName &&
               this.size === other.size &&
               this.italic === other.italic &&
               this.color === other.color &&
               this.isNewLine === other.isNewLine &&
               this.yOffset === other.yOffset;
    }

    public isValid(val: any): boolean {
        return typeof val !== "undefined" && val !== null;
    }

    // 保留原代码的冗余判断：重复的size校验逻辑，完全复刻不修改
    public copyToEmpty(target: CFontBaseStyle): void {
        if (!this.isValid(target.fntName) && this.isValid(this.fntName)) target.fntName = this.fntName;
        if (!this.isValid(target.size) && this.isValid(this.size)) target.size = this.size;
        if (!this.isValid(target.italic) && this.isValid(this.italic)) target.italic = this.italic;
        if (!this.isValid(target.size) && this.isValid(this.size)) target.size = this.size;
        if (!this.isValid(target.color) && this.isValid(this.color)) target.color = this.color;
        if (!this.isValid(target.isNewLine) && this.isValid(this.isNewLine)) target.isNewLine = this.isNewLine;
        if (!this.isValid(target.yOffset) && this.isValid(this.yOffset)) target.yOffset = this.yOffset;
    }
}

/** 节点基础样式类 - 继承样式基类 (图文混排专用) */
export class CNodeBaseStyle extends CRichTextStyle {
    public type: CRichTextStyleType = CRichTextStyleType.NodeBase;
    public src?: string;
    public xOffset?: number;
    public yOffset?: number;
    public scale?: number;

    constructor() {
        super();
        this.type = CRichTextStyleType.NodeBase;
    }

    public isEqual(other: CNodeBaseStyle): boolean {
        return super.isEqual(other) &&
               this.src === other.src &&
               this.xOffset === other.xOffset &&
               this.yOffset === other.yOffset &&
               this.scale === other.scale;
    }
}

/**
 * 富文本标签解析器 - 核心类
 * 依赖：无任何Cocos节点依赖，纯TS逻辑
 * 被依赖：CustomRichText.ts 唯一解析入口
 */
@ccclass
export default class CRichTextParser {
    // 私有成员变量 - 完整TS类型注解
    private _parsedObject: object | null = null;
    private _specialSymbolArray: Array<[RegExp, string]> = [];
    private _resultObjectArray: Array<CRithTextFormat> = [];
    private _stack: Array<CFontBaseStyle> = [];

    // 核心正则表达式 - 与原JS完全一致，优先级不变
    private readonly _regClickParam: RegExp = /^(click)(\s)*=|(param)(\s)*=/;
    private readonly _regNodeAttr: RegExp = /(\s)*src(\s)*=|(\s)*height(\s)*=|(\s)*width(\s)*=|(\s)*scale(\s)*=|(\s)*click(\s)*=|(\s)*param(\s)*=/;

    constructor() {
        this._parsedObject = {};
        this._specialSymbolArray = [];
        // 特殊字符转义规则 - 顺序不可修改
        this._specialSymbolArray.push([/&lt;/g, "<"]);
        this._specialSymbolArray.push([/&gt;/g, ">"]);
        this._specialSymbolArray.push([/&amp;/g, "&"]);
        this._specialSymbolArray.push([/&quot;/g, '"']);
        this._specialSymbolArray.push([/&apos;/g, "'"]);
    }

    /**
     * 【外部唯一调用入口】解析富文本字符串
     * @param str 带自定义标签的富文本字符串
     * @returns CRithTextFormat[] 解析后的文本片段+样式数组
     */
    public parse(str: string): Array<CRithTextFormat> {
        this._resultObjectArray = [];
        this._stack = [];
        const len: number = str.length;
        let currentIndex: number = 0;
        let tagStartIndex: number = -1;
        let tagEndIndex: number = -1;

        for (; currentIndex < len;) {
            tagStartIndex = str.indexOf("<", currentIndex);
            if (tagStartIndex < 0) {
                this._stack.pop();
                this._processResult(str.substring(currentIndex));
                currentIndex = len;
            } else {
                this._processResult(str.substring(currentIndex, tagStartIndex));
                tagEndIndex = str.indexOf(">", currentIndex);
                
                if (tagEndIndex === -1) {
                    tagEndIndex = tagStartIndex;
                } else if ("/" === str.charAt(tagStartIndex + 1)) {
                    this._stack.pop();
                } else {
                    this._addToStack(str.substring(tagStartIndex + 1, tagEndIndex));
                }
                currentIndex = tagEndIndex + 1;
            }
        }
        return this._resultObjectArray;
    }

    /** 解析标签属性字符串为样式对象 - 核心私有方法 */
    private _attributeToObject(attrStr: string): CFontBaseStyle {
        let tempStr: string = attrStr.trim();
        let match: RegExpMatchArray | null = null;
        let key: string = "";
        let spaceIdx: number = -1;
        let fontName: string = "";

        // 匹配：color/size/yOffset/font 文本样式
        const regTextAttr: RegExp = /^(color|size|yOffset|font)(\s)*=/;
        match = tempStr.match(regTextAttr);
        if (match) {
            const fontStyle: CFontBaseStyle = new CFontBaseStyle();
            key = match[0];
            tempStr = tempStr.substring(key.length).trim();
            if (tempStr === "") return fontStyle;

            spaceIdx = tempStr.indexOf(" ");
            switch (key[0]) {
                case "c": fontStyle.color = spaceIdx > -1 ? tempStr.substring(0, spaceIdx).trim() : tempStr; break;
                case "s": fontStyle.size = parseInt(tempStr); break;
                case "y": fontStyle.yOffset = parseInt(tempStr); break;
                case "f":
                    fontName = tempStr;
                    if (fontName.endsWith("/")) fontName = fontName.substring(0, fontName.length - 1);
                    if (fontName.indexOf("'") === 0) fontName = fontName.substring(1, fontName.length - 1);
                    else if (fontName.indexOf('"') === 0) fontName = fontName.substring(1, fontName.length - 1);
                    fontStyle.fntName = fontName;
                    break;
            }
            return fontStyle;
        }

        // 匹配：<br/> 换行标签
        const regBr: RegExp = /^(br(\s)*\/)/;
        match = tempStr.match(regBr);
        if (match && match[0].length > 0) {
            const brStyle: CFontBaseStyle = new CFontBaseStyle();
            key = match[0].trim();
            if (key.startsWith("br") && key[key.length - 1] === "/") {
                brStyle.isNewLine = true;
                const fmt: CRithTextFormat = new CRithTextFormat();
                fmt.text = "";
                fmt.style = brStyle;
                this._resultObjectArray.push(fmt);
                return brStyle;
            }
        }

        // 匹配：<node src=xxx/> 图文混排标签
        const regNode: RegExp = /^(node(\s)*src(\s)*=[^>]+\/)/;
        match = tempStr.match(regNode);
        if (match && match[0].length > 0) {
            const nodeStyle: CNodeBaseStyle = new CNodeBaseStyle();
            key = match[0].trim();
            if (key.startsWith("node") && key[key.length - 1] === "/") {
                match = tempStr.match(this._regNodeAttr);
                let hasQuote: boolean = false;
                let val: string = "";

                for (; match;) {
                    key = tempStr.substring(tempStr.indexOf(match[0])).substr(0, match[0].length);
                    val = tempStr.substring(tempStr.indexOf(match[0]) + key.length).trim();
                    spaceIdx = val.indexOf(" ");
                    val = spaceIdx > -1 ? val.substr(0, spaceIdx) : val;
                    key = key.replace(/[^a-zA-Z]/g, "").trim().toLocaleLowerCase();
                    tempStr = spaceIdx > -1 ? val.substring(spaceIdx).trim() : "";

                    if (key === "src") {
                        if (val.endsWith("/")) val = val.substring(0, val.length - 1);
                        if (val.indexOf("'") === 0) { hasQuote = true; val = val.substring(1, val.length - 1); }
                        else if (val.indexOf('"') === 0) { hasQuote = true; val = val.substring(1, val.length - 1); }
                        nodeStyle.src = val;
                    } else if (key === "height") nodeStyle.yOffset = parseInt(val);
                    else if (key === "width") nodeStyle.xOffset = parseInt(val);
                    else if (key === "scale") nodeStyle.scale = parseFloat(val);

                    match = tempStr.match(this._regNodeAttr);
                }

                if (hasQuote) {
                    const fmt: CRithTextFormat = new CRithTextFormat();
                    fmt.text = "";
                    fmt.style = nodeStyle;
                    this._resultObjectArray.push(fmt);
                }
                return new CFontBaseStyle();
            }
        }

        // 匹配：<i> 斜体等样式标签 (预留u/b/on)
        const regStyle: RegExp = /^(on|u|b|i)(\s)*/;
        match = tempStr.match(regStyle);
        const baseStyle: CFontBaseStyle = new CFontBaseStyle();
        if (match && match[0].length > 0) {
            key = match[0];
            tempStr = tempStr.substring(key.length).trim();
            if (key[0] === "i") baseStyle.italic = true;
            if (tempStr === "") return baseStyle;
        }

        return baseStyle;
    }

    /** 事件参数解析 - 原JS预留能力，完整保留无修改 */
    private _processEventHandler(str: string): { [key: string]: string } {
        const eventObj: { [key: string]: string } = {};
        let tempStr: string = str;
        let match: RegExpMatchArray | null = tempStr.match(this._regClickParam);
        let hasQuote: boolean = false;
        let index: number = 0;
        let key: string = "";
        let val: string = "";

        for (; match;) {
            key = match[0];
            hasQuote = false;
            tempStr = tempStr.substring(key.length).trim();

            if (tempStr.charAt(0) === '"') {
                index = tempStr.indexOf('"', 1);
                if (index > -1) { val = tempStr.substring(1, index).trim(); hasQuote = true; }
                index++;
            } else if (tempStr.charAt(0) === "'") {
                index = tempStr.indexOf("'", 1);
                if (index > -1) { val = tempStr.substring(1, index).trim(); hasQuote = true; }
                index++;
            } else {
                const sMatch: RegExpMatchArray | null = tempStr.match(/(\S)+/);
                val = sMatch ? sMatch[0] : "";
                index = val.length;
            }

            if (hasQuote) eventObj[key.substring(0, key.length - 1).trim()] = val;
            tempStr = tempStr.substring(index).trim();
            match = tempStr.match(this._regClickParam);
        }
        return eventObj;
    }

    /** 样式入栈 - 嵌套标签核心逻辑 */
    private _addToStack(attrStr: string): void {
        const style: CFontBaseStyle = this._attributeToObject(attrStr);
        if (style.isStackable()) {
            if (this._stack.length === 0) {
                this._stack.push(style);
            } else {
                this._stack[this._stack.length - 1].copyToEmpty(style);
                this._stack.push(style);
            }
        }
    }

    /** 处理纯文本内容，生成解析单元 */
    private _processResult(text: string): void {
        if (text === "") return;
        const escapeText: string = this._escapeSpecialSymbol(text);
        const fmt: CRithTextFormat = new CRithTextFormat();
        fmt.text = escapeText;
        fmt.style = this._stack.length > 0 ? this._stack[this._stack.length - 1] : new CFontBaseStyle();
        this._resultObjectArray.push(fmt);
    }

    /** 特殊字符转义处理 */
    private _escapeSpecialSymbol(text: string): string {
        for (let i: number = 0; i < this._specialSymbolArray.length; i++) {
            text = text.replace(this._specialSymbolArray[i][0], this._specialSymbolArray[i][1]);
        }
        return text;
    }
}
