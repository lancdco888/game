const { ccclass, property } = cc._decorator;

@ccclass
export default class GraphHeroBuffComponent extends cc.Component {
    // ====================== 编辑器序列化绑定属性 (与原JS完全一致，直接拖拽绑定即可) ======================
    @property(cc.Node)
    private nodeTxtBaseBonus: cc.Node = null;

    @property(cc.Node)
    private nodeTxtBingo: cc.Node = null;

    @property(cc.Node)
    private nodeTxtDailyBlitz: cc.Node = null;

    @property(cc.Node)
    private nodeTxtStarAlbum: cc.Node = null;

    @property(cc.Node)
    private nodeTxtFreeBonus: cc.Node = null;

    @property(cc.Node)
    private nodeCaption: cc.Node = null;

    @property(cc.Node)
    private nodeLine: cc.Node = null;

    @property(cc.Node)
    private pivotGraph: cc.Node = null;

    @property(cc.Node)
    private nodeImgGraph: cc.Node = null;

    @property(cc.Node)
    private nodeGraphBG2: cc.Node = null;

    @property(cc.Node)
    private nodeGraphBG1: cc.Node = null;

    @property(cc.Node)
    private pivotGauge: cc.Node = null;

    // ====================== 对外公开核心初始化方法 (HeroSubPopup 中调用此方法) ======================
    /**
     * 初始化英雄Buff属性图的所有UI节点布局
     * 所有坐标/尺寸/透明度/缩放均为原JS硬编码数值，精准还原无修改
     */
    public init(): void {
        // 所有文字标签坐标赋值
        this.nodeTxtBaseBonus.setPosition(159, 155);
        this.nodeTxtBingo.setPosition(265, -71);
        this.nodeTxtDailyBlitz.setPosition(300, 60);
        this.nodeTxtStarAlbum.setPosition(14, 60);
        this.nodeTxtFreeBonus.setPosition(57, -71);
        
        // 标题/分割线坐标赋值
        this.nodeCaption.setPosition(158, -168);
        this.nodeLine.setPosition(157, -127);

        // 核心属性图根节点坐标 + 尺寸赋值
        this.pivotGraph.setPosition(159, 38);
        this.nodeImgGraph.width = 218;
        this.nodeImgGraph.height = 206;

        // 双层背景图 透明度+尺寸赋值
        this.nodeGraphBG2.opacity = 1;
        this.nodeGraphBG2.width = 164;
        this.nodeGraphBG2.height = 154;
        this.nodeGraphBG1.opacity = 1;
        this.nodeGraphBG1.width = 196;
        this.nodeGraphBG1.height = 188;

        // 刻度盘根节点 坐标+缩放赋值
        this.pivotGauge.setPosition(159, 38);
        this.pivotGauge.setScale(1);
    }
}