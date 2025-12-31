import CRichTextParser, { CRichTextStyleType } from '../global_utility/CRichTextParser';
import TextUtil from '../global_utility/TextUtil';
const { ccclass, property, executeInEditMode } = cc._decorator;

/**
 * 富文本字体模板配置类 - 序列化配置【编辑器可见】
 * 用于映射 字体别名(key) → 实际字体文件(fnt)，支持多字体切换
 */
@ccclass('CRichTextFontTemplate')
export class CRichTextFontTemplate {
    @property({ displayName: "字体别名Key" })
    public key: string = "";

    @property({ type: cc.Font, displayName: "对应字体文件" })
    public fnt: cc.Font = null;
}

/**
 * 富文本节点模板配置类 - 序列化配置【编辑器可见】
 * 用于映射 节点别名(key) → 预制体节点(val)，支持图文混排（图片节点插入文本）
 */
@ccclass('CRichTextNodeTemplate')
export class CRichTextNodeTemplate {
    @property({ displayName: "节点别名Key" })
    public key: string = "";

    @property({ type: cc.Node, displayName: "对应节点预制体" })
    public val: cc.Node = null;
}

/**
 * 自定义富文本核心组件 (CustomRichText) ✅ 核心类
 * 继承cc.Component + 编辑器模式执行 → 编辑器实时预览富文本效果
 * 功能：富文本解析/多字体切换/图文混排/自动换行/对齐排版/节点缓存池优化
 * 依赖：CRichTextParser(富文本标签解析)、TextUtil(文本测量/切割工具)
 */
@ccclass('CustomRichText')
@executeInEditMode
export default class CustomRichText extends cc.Component {
    //#region ====== 静态常量 & 依赖实例 ======
    private readonly _textUtil: TextUtil = new TextUtil();
    private readonly _richTextParser: CRichTextParser = new CRichTextParser();
    //#endregion

    //#region ====== 私有核心状态变量 (原逻辑完整保留 不可修改) ======
    private _textArray: any = null;          // 解析后的富文本片段数组
    private _labelSegments: cc.Node[] = [];     // 当前显示的所有文本/图片节点
    private _labelSegmentsCache: cc.Node[] = [];// 节点缓存池 → 复用Label节点 优化性能
    private _linesWidth: number[] = [];      // 每行文本的宽度数组
    private _updateRichTextStatus: Function; // 富文本更新回调
    private _layoutDirty: boolean = true;    // 布局脏标记 → 标记是否需要重新排版
    private _lineOffsetX: number = 0;        // 当前行X轴偏移量
    private _lineCount: number = 1;          // 当前文本总行数
    private _labelWidth: number = 0;         // 富文本总宽度
    private _labelHeight: number = 0;        // 富文本总高度
    //#endregion

    //#region ====== 序列化配置属性 + GET/SET 访问器 ✅【原逻辑1:1复刻 核心】 ======
    @property({ multiline: true, tooltip: "富文本内容字符串" })
    private _string: string = "";
    public get string(): string { return this._string; }
    public set string(v: string) { this._string = v; this._updateRichTextStatus(); }

    @property({ type: cc.macro.TextAlignment, tooltip: "水平对齐方式" })
    private _horizontalAlign: cc.macro.TextAlignment = cc.macro.TextAlignment.LEFT;
    public get horizontalAlign(): cc.macro.TextAlignment { return this._horizontalAlign; }
    public set horizontalAlign(v: cc.macro.TextAlignment) {
        if (this._horizontalAlign !== v) { this._layoutDirty = true; this._horizontalAlign = v; this._updateRichTextStatus(); }
    }

    @property({ tooltip: "默认字体大小", min: 1, step: 1 })
    private _fontSize: number = 40;
    public get fontSize(): number { return this._fontSize; }
    public set fontSize(v: number) {
        if (this._fontSize !== v) { this._layoutDirty = true; this._fontSize = v; this._updateRichTextStatus(); }
    }

    @property({ tooltip: "字符间距", min: 0, step: 1 })
    private _fontSpacing: number = 0;
    public get fontSpacing(): number { return this._fontSpacing; }
    public set fontSpacing(v: number) {
        if (this._fontSpacing !== v) { this._layoutDirty = true; this._fontSpacing = v; this._updateRichTextStatus(); }
    }

    @property({ tooltip: "最大宽度(超过自动换行)", min: 0, step: 1 })
    private _maxWidth: number = 0;
    public get maxWidth(): number { return this._maxWidth; }
    public set maxWidth(v: number) {
        if (this._maxWidth !== v) { this._layoutDirty = true; this._maxWidth = v; this._updateRichTextStatus(); }
    }

    @property({ tooltip: "行高", min: 1, step: 1 })
    private _lineHeight: number = 40;
    public get lineHeight(): number { return this._lineHeight; }
    public set lineHeight(v: number) {
        if (this._lineHeight !== v) { this._layoutDirty = true; this._lineHeight = v; this._updateRichTextStatus(); }
    }

    @property({ type: cc.Font, tooltip: "默认字体文件" })
    private _defaultFont: cc.Font | null = null;
    public get defaultFont(): cc.Font | null { return this._defaultFont; }
    public set defaultFont(v: cc.Font | null) {
        if (this._defaultFont !== v) { this._layoutDirty = true; this._defaultFont = v; this._updateRichTextStatus(); }
    }

    @property({ type: [CRichTextFontTemplate], tooltip: "字体模板列表-多字体切换" })
    public fonts: CRichTextFontTemplate[] = [];

    @property({ type: [CRichTextNodeTemplate], tooltip: "节点模板列表-图文混排" })
    public nodes: CRichTextNodeTemplate[] = [];
    //#endregion

    //#region ====== 构造函数 初始化核心回调 ======
    constructor() {
        super();
        this._updateRichTextStatus = this._updateRichText.bind(this);
    }
    //#endregion

    //#region ====== 生命周期回调 ✅【原逻辑完整保留】 ======
    onLoad() {
        this.node.on(cc.Node.EventType.ANCHOR_CHANGED, this._anchorChange, this);
        this._addEventListeners();
    }

    start() {
        this._updateRichTextStatus();
    }

    onEnable() {
        this._layoutDirty = true;
        this._updateRichText();
        this._activateChildren(true);
    }

    onDisable() { }

    onDestroy() {
        this.node.off(cc.Node.EventType.ANCHOR_CHANGED, this._anchorChange, this);
        this._removeEventListeners();
        // 销毁所有文本节点
        this._labelSegments.forEach(node => node.destroy());
        this._labelSegments = [];
    }
    //#endregion

    //#region ====== 私有工具方法 - 节点/事件/状态管理 ======
    /** 创建新的Label节点 - 带默认样式初始化 */
    private getNewComp(text: string | number): cc.Node {
        let node = new cc.Node("RICHTEXT_CHILD");
        let label = node.getComponent(cc.Label) || node.addComponent(cc.Label) as any;
        // 节点默认属性
        node.setPosition(0, 0);
        node.setAnchorPoint(0.5, 0.5);
        node.setContentSize(128, 128);
        node.skewX = 0;
        // 文本默认属性
        const textStr = typeof text !== 'string' ? `${text}` : text;
        if (this.defaultFont) label.font = this.defaultFont;
        label.string = textStr;
        label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.TOP;
        label.fontSize = this.fontSize || 40;
        label.spacingX = this.fontSpacing || 0;
        label.overflow = cc.Label.Overflow.CLAMP; // overflow=0 对应CLAMP
        label.enableWrapText = true;
        label.lineHeight = 40;
        label.enableBold = false;
        label.enableItalics = false;
        label.enableUnderline = false;
        return node;
    }

    /** 销毁节点 */
    private removeComp(node: cc.Node) { node.destroy(); }

    /** 锚点变化 → 标记布局脏数据 重新排版 */
    private _anchorChange() { this._layoutDirty = true; this._updateRichTextStatus(); }

    /** 添加节点事件监听：触摸/颜色变化 */
    private _addEventListeners() {
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        this.node.on(cc.Node.EventType.COLOR_CHANGED, this._onColorChanged, this);
    }

    /** 移除节点事件监听 */
    private _removeEventListeners() {
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        this.node.off(cc.Node.EventType.COLOR_CHANGED, this._onColorChanged, this);
    }

    /** 颜色变化 → 同步所有子节点颜色 */
    private _onColorChanged(color: cc.Color) {
        this.node.children.forEach(node => node.color = color);
    }

    /** 触摸结束回调 - 预留空实现 便于业务扩展 */
    private _onTouchEnded() { }

    /** 激活/隐藏所有富文本子节点 */
    private _activateChildren(active: boolean) {
        this.node.children.forEach(node => {
            if (node.name === "RICHTEXT_CHILD" || node.name === "RICHTEXT_Image_CHILD") {
                node.active = active;
            }
        });
    }

    /** 重置所有排版状态 & 清空节点 */
    private _resetState() {
        // 回收所有子节点到缓存/销毁
        this.node.children.forEach(node => {
            if (node.name === "RICHTEXT_CHILD" || node.name === "RICHTEXT_Image_CHILD") {
                node.removeFromParent();
                node.name === "RICHTEXT_CHILD" && this.removeComp(node);
            }
        });
        // 重置状态变量
        this._labelSegments = [];
        this._labelSegmentsCache = [];
        this._linesWidth = [];
        this._lineOffsetX = 0;
        this._lineCount = 1;
        this._labelWidth = 0;
        this._labelHeight = 0;
        this._layoutDirty = true;
    }
    //#endregion

    //#region ====== 私有核心方法 - 文本测量/排版/节点创建 ======
    /** 创建带样式的文本节点 - 复用缓存池 */
    private _createFontLabel(text: string): cc.Node { return this.getNewComp(text); }

    /** 测量文本宽度 - 核心排版计算 */
    private _measureText(styleIdx: number, text?: string): number | Function|any {
        const measureFunc = (txt: string) => {
            let node: cc.Node|any;
            if (this._labelSegmentsCache.length === 0) {
                node = this._createFontLabel(txt);
                this._labelSegmentsCache.push(node);
            } else {
                node = this._labelSegmentsCache[0];
                node.getComponent(cc.Label)!.string = txt;
            }
            node._styleIndex = styleIdx;
            this._applyTextAttribute(node);
            return node.getContentSize().width;
        };
        return text ? measureFunc(text) : measureFunc;
    }

    /** 添加文本片段节点到容器 - 核心节点创建逻辑 */
    private _addLabelSegment(text: string, styleIdx: number): cc.Node {
        let node: cc.Node|any;
        // 复用缓存池节点 无则创建新节点
        if (this._labelSegmentsCache.length === 0) {
            node = this._createFontLabel(text);
        } else {
            node = this._labelSegmentsCache.pop()!;
            node.getComponent(cc.Label)!.string = text;
        }
        // 节点自定义属性 (用于排版)
        node._styleIndex = styleIdx;
        node._lineCount = this._lineCount;
        node.active = this.node.active;
        node.setAnchorPoint(0, 0);
        // 应用样式 + 添加到容器
        this._applyTextAttribute(node);
        this.node.addChild(node);
        this._labelSegments.push(node);
        return node;
    }

    /** 添加图片节点到富文本 - 图文混排核心 */
    private _addRichTextNodeElement(style: any, styleIdx: number) {
        const nodeKey = style.src;
        const nodeTemplate = this._getNodeTemplate(nodeKey);
        if (!nodeTemplate) { cc.warn(`CustomRichText: 未找到节点模板 → ${nodeKey}`); return; }
        
        const node = cc.instantiate(nodeTemplate) as any;
        node.name = "RICHTEXT_Image_CHILD";
        node.active = true;
        node.setAnchorPoint(0, 0);
        this.node.addChild(node);
        this._labelSegments.push(node);

        // 图片节点排版计算
        const imgWidth = Math.abs(node.width * style.scale);
        if (this.maxWidth > 0) {
            if (this._lineOffsetX + imgWidth > this.maxWidth) this._updateLineInfo();
            this._lineOffsetX += imgWidth;
        } else {
            this._lineOffsetX += imgWidth;
            if (this._lineOffsetX > this._labelWidth) this._labelWidth = this._lineOffsetX;
        }
        node._lineCount = this._lineCount;
        node._styleIndex = styleIdx;
    }

    /** 更新行信息 - 换行核心逻辑 */
    private _updateLineInfo() {
        this._linesWidth.push(this._lineOffsetX);
        this._lineOffsetX = 0;
        this._lineCount++;
    }

    /** 判断是否是最后一个换行符 */
    private _isLastComponentCR(text: string): boolean {
        return text.length - 1 === text.lastIndexOf("\n");
    }

    /** 获取首单词长度 - 英文单词换行处理 */
    private _getFirstWordLen(text: string, start: number, end: number): number {
        const char = text.charAt(start);
        if (this._textUtil.isUnicodeCJK(char) || this._textUtil.isUnicodeSpace(char)) return 1;
        let len = 1;
        for (let i = start + 1; i < end; i++) {
            const c = text.charAt(i);
            if (this._textUtil.isUnicodeSpace(c) || this._textUtil.isUnicodeCJK(c)) break;
            len++;
        }
        return len;
    }

    /** 带最大宽度的文本排版 - 自动换行核心 */
    private _updateRichTextWithMaxWidth(text: string, textWidth: number, styleIdx: number) {
        let currWidth = textWidth;
        // 超出宽度 → 按单词切割换行
        if (this._lineOffsetX > 0 && currWidth + this._lineOffsetX > this.maxWidth) {
            let start = 0;
            while (this._lineOffsetX <= this.maxWidth) {
                const wordLen = this._getFirstWordLen(text, start, text.length);
                const word = text.substr(start, wordLen);
                const wordWidth = this._measureText(styleIdx, word) as number;
                if (this._lineOffsetX + wordWidth > this.maxWidth) {
                    if (start > 0) {
                        const subText = text.substr(0, start);
                        this._addLabelSegment(subText, styleIdx);
                        text = text.substr(start);
                        currWidth = this._measureText(styleIdx, text) as number;
                    }
                    this._updateLineInfo();
                    break;
                }
                this._lineOffsetX += wordWidth;
                start += wordLen;
            }
        }
        // 文本宽度超出 → 切割文本分段显示
        if (currWidth > this.maxWidth) {
            const textFragments = this._textUtil.fragmentText(text, currWidth, this.maxWidth, this._measureText(styleIdx));
            textFragments.forEach((fragment: string, idx: number) => {
                const node = this._addLabelSegment(fragment, styleIdx);
                this._lineOffsetX += node.getContentSize().width;
                if (textFragments.length > 1 && idx < textFragments.length - 1) this._updateLineInfo();
            });
        } else {
            this._lineOffsetX += currWidth;
            this._addLabelSegment(text, styleIdx);
        }
    }
    //#endregion

    //#region ====== 私有核心方法 - 样式解析/应用 ======
    /** 根据别名获取字体文件 */
    private _getFont(fontKey: string): cc.Font | null {
        return this.fonts.find(item => item.key === fontKey)?.fnt || null;
    }

    /** 根据别名获取节点模板 */
    private _getNodeTemplate(nodeKey: string): cc.Node | null {
        return this.nodes.find(item => item.key === nodeKey)?.val || null;
    }

    /** 颜色值转换 - 支持十六进制(#FFFFFF) / 字面量(RED) */
    private _convertLiteralColorValue(colorStr: string): cc.Color {
        const upperColor = colorStr.toUpperCase();
        if ((cc.Color as any)[upperColor]) return (cc.Color as any)[upperColor];
        return new cc.Color().fromHEX(colorStr);
    }

    /** 给节点应用富文本样式 - 核心样式渲染 */
    private _applyTextAttribute(node: cc.Node|any) {
        const label = node.getComponent(cc.Label);
        if (!label) return;

        const styleIdx = node._styleIndex;
        label.lineHeight = this.lineHeight;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;

        // 获取富文本样式配置
        const style = this._textArray && this._textArray[styleIdx] ? this._textArray[styleIdx].style : null;
        // 颜色
        node.color = style && style.color ? this._convertLiteralColorValue(style.color) : this.node.color;
        // 斜体 → 通过skewX实现 原逻辑核心细节
        if (style && style.italic) node.skewX = 12;
        // 自定义字体
        if (style && style.fntName) label.font = this._getFont(style.fntName);
        // 自定义字号
        label.fontSize = style && style.size ? style.size : this.fontSize;
        // 强制刷新渲染
        label.setVertsDirty();
        label._forceUpdateRenderData();
    }

    /** 更新所有文本节点的样式属性 */
    private _updateLabelSegmentTextAttributes() {
        this._labelSegments.forEach(node => this._applyTextAttribute(node));
    }
    //#endregion

    //#region ====== 私有核心判断 - 是否需要更新布局 ======
    private _needsUpdateTextLayout(newTextArray: any): boolean {
        if (this._layoutDirty || !this._textArray || !newTextArray) return true;
        if (this._textArray.length !== newTextArray.length) return true;
        // 逐段对比文本内容和样式是否变化
        for (let i = 0; i < this._textArray.length; i++) {
            const oldItem = this._textArray[i];
            const newItem = newTextArray[i];
            if (oldItem.text !== newItem.text) return true;
            if (!oldItem.style.isEqual(newItem.style)) return true;
        }
        return false;
    }
    //#endregion

    //#region ====== 核心方法 - 更新富文本排版渲染 ✅【入口方法】 ======
    private _updateRichText() {
        if (!this.enabled) return;

        // 解析富文本标签 → 得到文本片段数组
        const parsedTextArray = this._richTextParser.parse(this.string);
        // 无需更新布局 → 仅刷新样式
        if (!this._needsUpdateTextLayout(parsedTextArray)) {
            this._textArray = parsedTextArray;
            this._updateLabelSegmentTextAttributes();
            return;
        }

        // 需更新布局 → 重置状态 + 重新排版
        this._textArray = parsedTextArray;
        this._resetState();

        let isLastCR = false;
        // 遍历所有解析后的文本片段
        for (let i = 0; i < this._textArray.length; i++) {
            const textItem = this._textArray[i];
            let text = textItem.text;
            if (text === "") {
                // 空文本 → 处理换行/图片节点
                switch (textItem.style.type) {
                    case CRichTextStyleType.FontBase:
                        if (textItem.style.isNewLine) { this._updateLineInfo(); continue; }
                        break;
                    case CRichTextStyleType.NodeBase:
                        this._addRichTextNodeElement(textItem.style, i);
                        continue;
                }
            }

            // 处理文本内的换行符
            const textLines = text.split("\n");
            for (let j = 0; j < textLines.length; j++) {
                const lineText = textLines[j];
                if (lineText !== "") {
                    isLastCR = false;
                    // 有最大宽度 → 自动换行排版
                    if (this.maxWidth > 0) {
                        const textWidth = this._measureText(i, lineText) as number;
                        this._updateRichTextWithMaxWidth(lineText, textWidth, i);
                    } else {
                        // 无最大宽度 → 直接添加文本节点
                        const node = this._addLabelSegment(lineText, i);
                        const nodeSize = node.getContentSize();
                        this._lineOffsetX += nodeSize.width;
                        if (this._lineOffsetX > this._labelWidth) this._labelWidth = this._lineOffsetX;
                    }
                    // 文本内有换行符 → 执行换行
                    if (textLines.length > 1 && j < textLines.length - 1) this._updateLineInfo();
                } else {
                    // 空行 → 处理换行
                    if (this._isLastComponentCR(text) && j === textLines.length - 1) continue;
                    this._updateLineInfo();
                    isLastCR = true;
                }
            }
        }

        // 记录最后一行宽度
        if (!isLastCR) this._linesWidth.push(this._lineOffsetX);
        // 设置富文本总宽高
        if (this.maxWidth > 0) this._labelWidth = this.maxWidth;
        this._labelHeight = (this._lineCount + this._textUtil.BASELINE_RATIO) * this.lineHeight;
        this.node.setContentSize(this._labelWidth, this._labelHeight);
        // 更新所有节点的最终位置
        this._updateRichTextPosition();
        // 布局更新完成
        this._layoutDirty = false;
    }

    /** 更新所有富文本节点的最终位置 - 对齐/偏移/缩放 核心排版 */
    private _updateRichTextPosition() {
        let currX = 0;
        let currLine = 1;
        const totalLines = this._lineCount;
        const anchorOffsetX = (this.node.anchorX - 0.5) * this._labelWidth;
        const anchorOffsetY = (this.node.anchorY - 0.5) * this._labelHeight;

        this._labelSegments.forEach(node => {
            const nodeLine = (node as any)._lineCount;
            // 换行 → 重置X偏移
            if (nodeLine > currLine) { currX = 0; currLine = nodeLine; }

            // 根据对齐方式计算X偏移
            let alignOffsetX = 0;
            switch (this.horizontalAlign) {
                case cc.macro.TextAlignment.LEFT: alignOffsetX = -this._labelWidth / 2; break;
                case cc.macro.TextAlignment.CENTER: alignOffsetX = -this._linesWidth[nodeLine - 1] / 2; break;
                case cc.macro.TextAlignment.RIGHT: alignOffsetX = this._labelWidth / 2 - this._linesWidth[nodeLine - 1]; break;
            }

            // 获取样式配置 → 偏移/缩放
            const styleIdx = (node as any)._styleIndex;
            const style = this._textArray[styleIdx]?.style;
            node.x = currX + alignOffsetX;
            if (style && style.xOffset) node.x += style.xOffset;

            // Y轴位置计算
            const nodeSize = node.getContentSize();
            node.y = this.lineHeight * (totalLines - nodeLine) - this._labelHeight / 2;
            if (style && style.yOffset) node.y += style.yOffset;
            if (style && style.scale !== undefined) node.setScale(style.scale);

            // 累加当前行X偏移
            if (nodeLine === currLine) currX += Math.abs(nodeSize.width * node.scale);
            // 修正锚点偏移
            node.x -= anchorOffsetX;
            node.y -= anchorOffsetY;
        });
    }
    //#endregion
}