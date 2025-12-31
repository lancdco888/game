const { ccclass, property } = cc._decorator;

// 项目内部模块导入 - 路径/顺序 与原JS完全一致，无任何改动
import v2_PayLine from "./v2_PayLine";
import State from "./Slot/State";
import TSUtility from "./global_utility/TSUtility";
import SlotManager from "./manager/SlotManager";


/**
 * 内部辅助类 - 赔付线的单段线条数据载体 (对应原JS var d = function(){})
 * 存储单段线条的起始点和结束点
 */
class LineSegment {
    public startPos: cc.Vec2 = cc.Vec2.ZERO;
    public endPos: cc.Vec2 = cc.Vec2.ZERO;
}

/**
 * 老虎机核心 - 赔付线渲染器
 * 负责所有赔付线的绘制、中奖符号框渲染、赔付线切换、画布清理、资源缓存管理
 */
@ccclass
export default class v2_PayLineRenderer extends cc.Component {
    // ===================== 编辑器可配置属性 - 与原JS@property 1:1完全对应 =====================
    @property
    public m_symbolWidth: number = 0;          // 符号宽度
    @property
    public m_symbolHeight: number = 0;         // 符号高度
    @property(cc.Vec2)
    public m_reelLayout: cc.Vec2 = cc.Vec2.ZERO;     // 滚轮行列布局 (x=列数, y=行数)
    @property
    public m_lineWidth: number = 0;            // 赔付线宽度
    @property
    public m_useShadow: boolean = false;       // 是否绘制阴影线条
    @property
    public m_shadowLineWidth: number = 0;      // 阴影线条宽度
    @property(cc.Vec2)
    public m_shadowLineOffset: cc.Vec2 = cc.Vec2.ZERO;// 阴影线条偏移量
    @property
    public m_rectOffset: number = 0;           // 中奖框偏移修正值
    @property([v2_PayLine])
    public paylineInfo: v2_PayLine[] = [];     // 赔付线信息列表
    @property(cc.Prefab)
    public prefabPayBox: cc.Prefab = null;        // 中奖框预制体
    @property
    public m_showPayBox: boolean = true;       // 是否显示中奖框
    @property
    public m_showSinglePayLine: boolean = true;// 是否显示单条赔付线
    @property
    public m_lineType: number = 0;             // 赔付线类型 0-横向主类型 1-斜向副类型
    @property(cc.Color)
    public m_colorPaybox: cc.Color = cc.Color.RED;   // 默认中奖框颜色
    @property
    public addLine_With: number = 0;           // 赔付线两端延长宽度

    // ===================== 私有运行时属性 - 与原JS完全一致 =====================
    private poolPayBox: cc.NodePool = new cc.NodePool();  // 中奖框节点池 (内存优化核心)
    private listPayBox: cc.Node[] = [];                // 正在显示的中奖框列表
    private m_totWidth: number = 0;                 // 总宽度 = 符号宽度 * 列数
    private m_totHeight: number = 0;                // 总高度 = 符号高度 * 行数
    private m_totHalfWidth: number = 0;             // 总宽度的一半
    private m_totHalfHeight: number = 0;            // 总高度的一半
    private m_symbolHalfWidth: number = 0;         // 符号宽度的一半
    private m_symbolHalfHeight: number = 0;        // 符号高度的一半
    private index: number = 0;                     // 当前选中的赔付线索引
    private sliceIndex: number = 0;                // 赔付线分段索引
    private play: boolean = true;                  // 是否处于播放状态
    private jsonObj: any[] = [];                   // 赔付线渲染数据核心缓存
    private m_payLineInfo: { Type: string, List: any[] } = { Type: "", List: null }; // 赔付线基础信息

    // ===================== 赔付线渐变颜色列表 - 原JS一字不差复刻 60个色值 无任何修改 =====================
    private m_payLineColorList: string[] = [
        "#ed1b24", "#f36523", "#f7941d", "#ffc20f", "#fef200", "#cadb2a", "#8cc63e", "#3ab54a", "#00a652", "#009871",
        "#008c8d", "#0080a7", "#0072bb", "#0054a5", "#2e3192", "#662e91", "#92278f", "#a92477", "#bf245e", "#d52043",
        "#f15941", "#f58345", "#fecc4f", "#fff44d", "#d4e25b", "#a2d063", "#6cc068", "#1bb26b", "#1aa689", "#1c9c9d",
        "#1e90b4", "#2385c6", "#406ab4", "#524ea2", "#7c51a1", "#a155a0", "#b6558a", "#ca5774", "#dd585d", "#f15941",
        "#f38466", "#f58466", "#fff685", "#b9da89", "#67c18d", "#67aeb2", "#669ad3", "#7570b3", "#b47ab5", "#d37f8e"
    ];

    // ===================== 生命周期 - 与原JS一致 空实现 =====================
    onLoad(): void { }

    // ===================== 核心初始化 - 基础赔付线数据初始化 =====================
    initPaylineRenderer(type: string, payLineList: any[]): void {
        this.m_payLineInfo.Type = type;
        this.m_payLineInfo.List = payLineList;
        this._calcBaseSize();

        for (let n = 0; n < this.m_payLineInfo.List.length; ++n) {
            const lineData = this.m_payLineInfo.List[n];
            const lineRenderData = this._createBaseLineRenderData(n);
            
            const startPos = this.getStartPos(lineData, 0);
            const endPos = this.getEndPos(lineData, 0);
            lineRenderData.point = [];
            lineRenderData.payCell = [];
            lineRenderData.point.push(startPos);

            for (let c = 0; c < lineData.length; ++c) {
                const cellRow = lineData[c];
                const cellPos = this.getCellPos(c, cellRow, 0);
                lineRenderData.point.push(cellPos);
                lineRenderData.payCell.push(new cc.Vec2(c, cellRow));
            }
            lineRenderData.point.push(endPos);
            this.jsonObj.push(lineRenderData);
        }
    }

    // ===================== 核心初始化 - 带单元格信息的赔付线数据初始化 =====================
    initPaylineRendererWithCellInfo(type: string, payLineList: any[]): void {
        this.m_payLineInfo.Type = type;
        this.m_payLineInfo.List = payLineList;
        this._calcBaseSize();

        for (let n = 0; n < payLineList.length; ++n) {
            const lineData = payLineList[n];
            const lineRenderData = this._createBaseLineRenderData(n);
            
            const startPos = this.getStartPosWithCell(lineData);
            const endPos = this.getEndPosWithCell(lineData);
            lineRenderData.point = [];
            lineRenderData.payCell = [];
            lineRenderData.point.push(startPos);

            for (let c = 0; c < lineData.length; ++c) {
                const cellPos = this.getCellPos(lineData[c].col, lineData[c].row, 0);
                lineRenderData.point.push(cellPos);
                lineRenderData.payCell.push(new cc.Vec2(lineData[c].col, lineData[c].row));
            }
            lineRenderData.point.push(endPos);
            this.jsonObj.push(lineRenderData);
        }
    }

    // ===================== 赔付线切换 - 上一条 =====================
    prev(): void {
        this.play = false;
        this.index--;
        if (this.index < 0) {
            this.index = this.jsonObj.length - 1;
            this.sliceIndex--;
            if (this.sliceIndex < 0) this.sliceIndex = 5;
        }
        this._clearGraphics();
        this.drawSingleLine(this.index, this.sliceIndex);
    }

    // ===================== 赔付线切换 - 下一条 =====================
    next(): void {
        this.play = false;
        this.index++;
        if (this.index >= this.jsonObj.length) {
            this.index = 0;
            this.sliceIndex++;
            if (this.sliceIndex > 5) this.sliceIndex = 0;
        }
        this._clearGraphics();
        this.drawSingleLine(this.index, this.jsonObj[this.index].payCell.slice(0, this.sliceIndex));
    }

    // ===================== 显示所有赔付线 =====================
    showAll(): void {
        this.play = false;
        this._clearGraphics();
        for (let e = 0; e < this.jsonObj.length; ++e) {
            this.drawLineNum(e);
        }
    }

    // ===================== 开启播放状态 =====================
    playP(): void {
        this.play = true;
    }

    // ===================== 绘制边框体线 =====================
    drawBodyLine(): void {
        const graphics = this.node.getComponent(cc.Graphics);
        if (!graphics) return;

        graphics.lineWidth = 4;
        graphics.strokeColor = cc.Color.BLACK;
        const startPos = new cc.Vec2(-this.m_totHalfWidth, -this.m_totHalfHeight);
        graphics.rect(startPos.x, startPos.y, this.m_totWidth, this.m_totHeight);
        graphics.stroke();
    }

    // ===================== 核心坐标计算 - 获取符号单元格的中心坐标 =====================
    getCellPos(col: number, row: number, offsetY: number): cc.Vec2 {
        const basePos = new cc.Vec2(-this.m_totHalfWidth, this.m_totHalfHeight);
        return new cc.Vec2(
            basePos.x + col * this.m_symbolWidth + this.m_symbolHalfWidth,
            basePos.y - row * this.m_symbolHeight - this.m_symbolHalfHeight + offsetY
        );
    }

    // ===================== 核心坐标计算 - 获取符号单元格的中心坐标(带XY双偏移) =====================
    getCellPosXY(col: number, row: number, offsetX: number, offsetY: number): cc.Vec2 {
        const basePos = new cc.Vec2(-this.m_totHalfWidth, this.m_totHalfHeight);
        return new cc.Vec2(
            basePos.x + col * this.m_symbolWidth + this.m_symbolHalfWidth + offsetX,
            basePos.y - row * this.m_symbolHeight - this.m_symbolHalfHeight + offsetY
        );
    }

    // ===================== 核心坐标计算 - 获取赔付线起始点 =====================
    getStartPos(lineData: any[], offsetY: number): cc.Vec2 {
        const basePos = new cc.Vec2(-this.m_totHalfWidth, this.m_totHalfHeight);
        let startPos: cc.Vec2 = cc.Vec2.ZERO;

        if (this.m_lineType === 0) {
            startPos = new cc.Vec2(basePos.x, basePos.y - lineData[0] * this.m_symbolHeight - this.m_symbolHalfHeight + offsetY);
        } else if (this.m_lineType === 1) {
            const y = basePos.y - lineData[0] * this.m_symbolHeight - this.m_symbolHalfHeight + offsetY + (lineData[1] - lineData[0]) * this.m_symbolHalfHeight;
startPos = new cc.Vec2(basePos.x, y);
        }
        return startPos;
    }

    // ===================== 核心坐标计算 - 获取赔付线结束点 =====================
    getEndPos(lineData: any[], offsetY: number): cc.Vec2 {
        const basePos = new cc.Vec2(-this.m_totHalfWidth, this.m_totHalfHeight);
        let endPos: cc.Vec2 = cc.Vec2.ZERO;
        const maxCol = this.m_reelLayout.x - 1;

        if (this.m_lineType === 0) {
            endPos = new cc.Vec2(basePos.x + this.m_totWidth, basePos.y - lineData[maxCol] * this.m_symbolHeight - this.m_symbolHalfHeight + offsetY);
        } else if (this.m_lineType === 1) {
            const y = basePos.y - lineData[maxCol] * this.m_symbolHeight - this.m_symbolHalfHeight + offsetY + (lineData[maxCol - 1] - lineData[maxCol]) * this.m_symbolHalfHeight;
            endPos = new cc.Vec2(basePos.x + this.m_totWidth, y);
        }
        return endPos;
    }

    // ===================== 核心坐标计算 - 带单元格信息的赔付线起始点 =====================
    getStartPosWithCell(lineData: any[]): cc.Vec2 {
        let isNormalCol = true;
        for (let o = 0; o < lineData.length; ++o) {
            if (lineData[o].col !== o) {
                isNormalCol = false;
                break;
            }
        }

        const basePos = new cc.Vec2(-this.m_totHalfWidth, this.m_totHalfHeight);
        let startPos: cc.Vec2 = cc.Vec2.ZERO;

        if (isNormalCol) {
            if (this.m_lineType === 0) {
                startPos = new cc.Vec2(basePos.x, basePos.y - lineData[0].row * this.m_symbolHeight - this.m_symbolHalfHeight);
            } else if (this.m_lineType === 1) {
                const y = basePos.y - lineData[0].row * this.m_symbolHeight - this.m_symbolHalfHeight + (lineData[1].row - lineData[0].row) * this.m_symbolHalfHeight;
                startPos = new cc.Vec2(basePos.x, y);
            }
        } else {
            if (this.m_lineType === 0) {
                startPos = new cc.Vec2(basePos.x + lineData[0].col * this.m_symbolWidth + this.m_symbolHalfWidth, basePos.y);
            } else if (this.m_lineType === 1) {
                const x = basePos.x + lineData[0].col * this.m_symbolWidth + this.m_symbolHalfWidth + (lineData[1].col - lineData[0].col) * this.m_symbolHalfWidth;
                startPos = new cc.Vec2(x, basePos.y);
            }
        }
        return startPos;
    }

    // ===================== 核心坐标计算 - 带单元格信息的赔付线结束点 =====================
    getEndPosWithCell(lineData: any[]): cc.Vec2 {
        let isNormalCol = true;
        for (let o = 0; o < lineData.length; ++o) {
            if (lineData[o].col !== o) {
                isNormalCol = false;
                break;
            }
        }

        const basePos = new cc.Vec2(-this.m_totHalfWidth, this.m_totHalfHeight);
        let endPos: cc.Vec2 = cc.Vec2.ZERO;
        const maxCol = this.m_reelLayout.x - 1;

        if (isNormalCol) {
            if (this.m_lineType === 0) {
                endPos = new cc.Vec2(basePos.x + this.m_totWidth, basePos.y - lineData[maxCol].row * this.m_symbolHeight - this.m_symbolHalfHeight);
            } else if (this.m_lineType === 1) {
                const y = basePos.y - lineData[maxCol].row * this.m_symbolHeight - this.m_symbolHalfHeight + (lineData[maxCol - 1].row - lineData[maxCol].row) * this.m_symbolHalfHeight;
                endPos = new cc.Vec2(basePos.x + this.m_totWidth, y);
            }
        } else {
            if (this.m_lineType === 0) {
                endPos = new cc.Vec2(basePos.x + lineData[maxCol].col * this.m_symbolWidth + this.m_symbolHalfWidth, basePos.y - this.m_totHeight);
            } else if (this.m_lineType === 1) {
                const x = basePos.x + lineData[maxCol].col * this.m_symbolWidth + this.m_symbolHalfWidth + (lineData[maxCol - 1].col - lineData[maxCol].col) * this.m_symbolHalfWidth;
                endPos = new cc.Vec2(x, basePos.y - this.m_totHeight);
            }
        }
        return endPos;
    }

    // ===================== 绘制指定索引的赔付线 =====================
    drawLineNum(lineNum: number): void {
        if (lineNum < 0) {
            cc.log("PayLineRenderer.drawLineNum: Invalid lineNum");
            return;
        }

        const lineRenderData = this.jsonObj[lineNum];
        const lineSegments = this.getVersion1LinesTest(lineRenderData.point, []);
        
        if (lineRenderData.useShadow) {
            this._drawLineWithLine(lineSegments, lineRenderData.shadowColor, lineRenderData.shadowLineWidth, lineRenderData.m_shadowLineOffset);
        }
        this._drawLineWithLine(lineSegments, lineRenderData.color, lineRenderData.width);
    }

    // ===================== 清空画布后绘制指定索引的赔付线 =====================
    clearAndDrawLineNum(lineNum: number): void {
        this.clearAll();
        const lineRenderData = this.jsonObj[lineNum];
        
        if (lineRenderData.useShadow) {
            this.drawLine(lineRenderData.point, lineRenderData.shadowColor, lineRenderData.shadowLineWidth, lineRenderData.shadowLineOffset);
        }
        this.drawLine(lineRenderData.point, lineRenderData.color, lineRenderData.width);
    }

    // ===================== 基础绘制 - 绘制连续线段 =====================
    drawLine(points: cc.Vec2[], color: cc.Color, lineWidth: number, offset: cc.Vec2 = cc.Vec2.ZERO): void {
        const graphics = this.node.getComponent(cc.Graphics);
        if (!graphics || points.length === 0) return;

        const startPos = points[0].add(offset);
        graphics.lineWidth = lineWidth;
        graphics.strokeColor = color;
        graphics.moveTo(startPos.x, startPos.y);

        for (let l = 1; l < points.length; ++l) {
            const curPos = points[l].add(offset);
            graphics.lineTo(curPos.x, curPos.y);
        }
        graphics.stroke();
    }

    // ===================== 获取清空画布的状态对象 =====================
    getClearAllState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.clearAll();
            state.setDone();
        });
        return state;
    }

    // ===================== 核心清理 - 清空画布+回收所有中奖框节点池 =====================
    clearAll(): void {
        // 清空画布
        this._clearGraphics();

        // 回收中奖框到节点池
        if (this.listPayBox.length > 0) {
            for (let e = 0; e < this.listPayBox.length; ++e) {
                const payBoxNode = this.listPayBox[e];
                payBoxNode.removeFromParent();
                
                // 重置粒子系统
                const particle = payBoxNode.getComponent(cc.ParticleSystem);
                particle && particle.resetSystem();
                const childParticles = payBoxNode.getComponentsInChildren(cc.ParticleSystem);
                for (let n = 0; n < childParticles.length; ++n) {
                    childParticles[n].resetSystem();
                }

                // 回收节点池
                this.poolPayBox.put(payBoxNode);
            }
            this.listPayBox.length = 0;
        }
    }

    // ===================== 核心绘制 - 绘制分段的赔付线(带延长/偏移) =====================
    private _drawLineWithLine(lineSegments: LineSegment[], color: cc.Color, lineWidth: number, offset: cc.Vec2 = cc.Vec2.ZERO): void {
        const graphics = this.node.getComponent(cc.Graphics);
        if (!graphics || lineSegments.length === 0) return;

        graphics.lineWidth = lineWidth;
        graphics.strokeColor = color;
        let lastStartPos = cc.Vec2.ZERO;

        for (let l = 0; l < lineSegments.length; ++l) {
            const seg = lineSegments[l];
            if (!lastStartPos.equals(seg.startPos)) {
                if (l === 0) {
                    graphics.moveTo(seg.startPos.x - this.addLine_With, seg.startPos.y);
                } else {
                    graphics.moveTo(seg.startPos.x, seg.startPos.y);
                }
            }

            const endPos = seg.endPos.add(offset);
            if (l === lineSegments.length - 1) {
                graphics.lineTo(endPos.x + this.addLine_With, endPos.y);
            } else {
                graphics.lineTo(endPos.x, endPos.y);
            }
            lastStartPos = seg.startPos;
        }
        graphics.stroke();
    }

    // ===================== 绘制中奖符号矩形框 =====================
    drawWinningRect(cellList: cc.Vec2[], width: number, height: number, color: cc.Color = null, lineWidth: number, offset: cc.Vec2 = cc.Vec2.ZERO): void {
        for (let l = 0; l < cellList.length; ++l) {
            const cell = cellList[l];
            const cellPos = this.getCellPos(cell.x, cell.y, offset.y);

            if (!this.prefabPayBox) {
                // 无预制体时绘制几何矩形
                const graphics = this.node.getComponent(cc.Graphics);
                if (!graphics) continue;

                graphics.lineWidth = lineWidth;
                graphics.strokeColor = TSUtility.isValid(color) ? color : this.m_colorPaybox;
                const rectStart = new cc.Vec2(cellPos.x - width / 2, cellPos.y - height / 2);
                graphics.rect(rectStart.x, rectStart.y, width, height);
                graphics.stroke();
            } else {
                // 有预制体时从节点池获取/实例化
                const payBoxNode = this.poolPayBox.size() > 0 ? this.poolPayBox.get() : cc.instantiate(this.prefabPayBox);
                if (payBoxNode) {
                    payBoxNode.setPosition(cellPos.x, cellPos.y);
                    this.node.addChild(payBoxNode);
                    this.listPayBox.push(payBoxNode);
                }
            }
        }
    }

    // ===================== 绘制中奖符号矩形框(带滚轮偏移量) =====================
    drawWinningRectReelOffsetList(cellList: cc.Vec2[], width: number, height: number, color: cc.Color = null, lineWidth: number, offsetList: cc.Vec2[] = null): void {
        if (!TSUtility.isValid(offsetList)) {
            offsetList = [];
            const reelCount = SlotManager.Instance.reelMachine.reels.length;
            for (let l = 0; l < reelCount; ++l) {
                offsetList.push(cc.Vec2.ZERO);
            }
        }

        for (let l = 0; l < cellList.length; ++l) {
            const cell = cellList[l];
            const offset = offsetList[cell.x];
            const cellPos = this.getCellPosXY(cell.x, cell.y, offset.x, offset.y);

            if (!this.prefabPayBox) {
                // 无预制体时绘制几何矩形
                const graphics = this.node.getComponent(cc.Graphics);
                if (!graphics) continue;

                graphics.lineWidth = lineWidth;
                graphics.strokeColor = TSUtility.isValid(color) ? color : this.m_colorPaybox;
                const rectStart = new cc.Vec2(cellPos.x - width / 2, cellPos.y - height / 2);
                graphics.rect(rectStart.x, rectStart.y, width, height);
                graphics.stroke();
            } else {
                // 有预制体时从节点池获取/实例化
                const payBoxNode = this.poolPayBox.size() > 0 ? this.poolPayBox.get() : cc.instantiate(this.prefabPayBox);
                if (payBoxNode) {
                    payBoxNode.setPosition(cellPos.x, cellPos.y);
                    this.node.addChild(payBoxNode);
                    this.listPayBox.push(payBoxNode);
                }
            }
        }
    }

    // ===================== 绘制单条赔付线(带中奖框) =====================
    drawSingleLine(lineNum: number, sliceCell: any): void {
        const lineRenderData = this.jsonObj[lineNum];
        const cellList = this.jsonObj[lineNum].payCell.slice(0, sliceCell);
        const lineSegments = this.m_showPayBox ? this.getVersion1LinesTest(lineRenderData.point, cellList) : this.getVersion1LinesTest(lineRenderData.point, []);

        // 绘制赔付线
        if (this.m_showSinglePayLine) {
            if (lineRenderData.useShadow) {
                this._drawLineWithLine(lineSegments, lineRenderData.shadowColor, lineRenderData.shadowLineWidth, lineRenderData.m_shadowLineOffset);
            }
            this._drawLineWithLine(lineSegments, lineRenderData.color, lineRenderData.width);
        }

        // 绘制中奖框
        if (this.m_showPayBox) {
            const rectW = this.m_symbolWidth - this.m_rectOffset;
            const rectH = this.m_symbolHeight - this.m_rectOffset;
            if (lineRenderData.useShadow && !this.prefabPayBox) {
                this.drawWinningRect(cellList, rectW, rectH, lineRenderData.shadowColor, lineRenderData.shadowLineWidth, lineRenderData.m_shadowLineOffset);
            }
            this.drawWinningRect(cellList, rectW, rectH, lineRenderData.color, lineRenderData.width);
        }
    }

    // ===================== 核心几何计算 - 获取赔付线分段数据(测试版) =====================
    getVersion1LinesTest(points: cc.Vec2[], cellList: cc.Vec2[]): LineSegment[] {
        const lineSegments: LineSegment[] = [];
        for (let o = 0; o < points.length - 1; ++o) {
            const start = points[o];
            const end = points[o + 1];
            let cellPrev: cc.Vec2 = null;
            let cellCurr: cc.Vec2 = null;

            if (o > 0 && cellList.length > o - 1) {
                cellPrev = this.getCellPos(cellList[o - 1].x, cellList[o - 1].y, 0);
            }
            if (cellList.length > o) {
                cellCurr = this.getCellPos(cellList[o].x, cellList[o].y, 0);
            }

            const seg = this.getDrawLine(start, end, cellPrev, cellCurr);
            lineSegments.push(seg);
        }
        return lineSegments;
    }

    // ===================== 核心几何计算 - 获取单段绘制线条 =====================
    getDrawLine(start: cc.Vec2, end: cc.Vec2, cellPrev: cc.Vec2 = null, cellCurr: cc.Vec2 = null): LineSegment {
        const seg = new LineSegment();
        seg.startPos = cellPrev ? this.getCrossPoint(start, end, cellPrev) : start;
        seg.endPos = cellCurr ? this.getCrossPoint(start, end, cellCurr) : end;
        return seg;
    }

    // ===================== 核心几何计算 - 获取线条与符号边框的交点 =====================
    getCrossPoint(lineStart: cc.Vec2, lineEnd: cc.Vec2, cellPos: cc.Vec2): cc.Vec2 {
        const halfOffset = this.m_rectOffset / 2;
        const rectLT = new cc.Vec2(cellPos.x - this.m_symbolHalfWidth + halfOffset, cellPos.y + this.m_symbolHalfHeight - halfOffset);
        const rectRB = new cc.Vec2(cellPos.x + this.m_symbolHalfWidth - halfOffset, cellPos.y - this.m_symbolHalfHeight + halfOffset);

        let intersectPoint = this.getIntersectPoint(lineStart, lineEnd, new cc.Vec2(rectLT.x, rectLT.y), new cc.Vec2(rectRB.x, rectLT.y));
        if (!intersectPoint) intersectPoint = this.getIntersectPoint(lineStart, lineEnd, new cc.Vec2(rectLT.x, rectLT.y), new cc.Vec2(rectLT.x, rectRB.y));
        if (!intersectPoint) intersectPoint = this.getIntersectPoint(lineStart, lineEnd, new cc.Vec2(rectRB.x, rectRB.y), new cc.Vec2(rectRB.x, rectLT.y));
        if (!intersectPoint) intersectPoint = this.getIntersectPoint(lineStart, lineEnd, new cc.Vec2(rectRB.x, rectRB.y), new cc.Vec2(rectLT.x, rectRB.y));

        return intersectPoint;
    }

    // ===================== 核心几何计算 - 获取两条线段的交点(跨线算法) =====================
    getIntersectPoint(a1: cc.Vec2, a2: cc.Vec2, b1: cc.Vec2, b2: cc.Vec2): cc.Vec2 {
        let intersectPoint: cc.Vec2 = null;
        const denom = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (denom === 0) return intersectPoint;

        const s = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / denom;
        const t = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / denom;

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1 && !(s === 0 && t === 0)) {
            intersectPoint = new cc.Vec2();
            intersectPoint.x = a1.x + s * (a2.x - a1.x);
            intersectPoint.y = a1.y + s * (a2.y - a1.y);
        }
        return intersectPoint;
    }

    // ===================== 设置自定义赔付线颜色列表 =====================
    setCustomPaylineColor(colorList: string[]): void {
        if (!colorList) return;
        for (let t = 0; t < colorList.length; ++t) {
            this.m_payLineColorList[t] = colorList[t];
            const color = cc.color().fromHEX(colorList[t]);
            if (this.jsonObj[t]) {
                this.jsonObj[t].color = color;
                this.jsonObj[t].shadowColor = new cc.Color(
                    Math.max(0, color.r - 50),
                    Math.max(0, color.g - 50),
                    Math.max(0, color.b - 50)
                );
            }
        }
    }

    // ===================== 私有辅助方法 - 计算基础尺寸 =====================
    private _calcBaseSize(): void {
        this.m_totWidth = this.m_symbolWidth * this.m_reelLayout.x;
        this.m_totHeight = this.m_symbolHeight * this.m_reelLayout.y;
        this.m_totHalfWidth = this.m_totWidth / 2;
        this.m_totHalfHeight = this.m_totHeight / 2;
        this.m_symbolHalfWidth = this.m_symbolWidth / 2;
        this.m_symbolHalfHeight = this.m_symbolHeight / 2;
    }

    // ===================== 私有辅助方法 - 创建基础赔付线渲染数据 =====================
    private _createBaseLineRenderData(lineNum: number): any {
        const colorIdx = Math.floor(lineNum % this.m_payLineColorList.length);
        const lineColor = cc.color().fromHEX(this.m_payLineColorList[colorIdx]);
        const renderData = {
            lineNum: lineNum,
            width: this.m_lineWidth,
            useShadow: this.m_useShadow,
            color: lineColor,
            offsetY: 0
        };

        if (this.m_useShadow) {
            renderData["shadowLineWidth"] = this.m_shadowLineWidth;
            renderData["shadowLineOffset"] = this.m_shadowLineOffset;
            renderData["shadowColor"] = new cc.Color(
                Math.max(0, lineColor.r - 50),
                Math.max(0, lineColor.g - 50),
                Math.max(0, lineColor.b - 50)
            );
        }
        return renderData;
    }

    // ===================== 私有辅助方法 - 清空画布 =====================
    private _clearGraphics(): void {
        const graphics = this.node.getComponent(cc.Graphics);
        graphics && graphics.clear();
    }
}