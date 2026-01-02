const { ccclass, property } = cc._decorator;

// 导入项目依赖模块 - 路径与原JS完全一致
import HeroManager from "../manager/HeroManager";

@ccclass
export default class HeroStatSetter extends cc.Component {
    // ====================== 编辑器绑定序列化属性 (与原JS一一对应，直接拖拽绑定) ======================
    @property(cc.Graphics)
    private statGraphics: cc.Graphics = null;

    @property([cc.Node])
    private statBasePos: cc.Node[] = [];

    @property([cc.Node])
    private statStarAlbumPos: cc.Node[] = [];

    @property([cc.Node])
    private statFreeBonusPos: cc.Node[] = [];

    @property([cc.Node])
    private statBingoPos: cc.Node[] = [];

    @property([cc.Node])
    private statDailyBlitzPos: cc.Node[] = [];

    // ====================== 私有缓存变量 - 坐标点位缓存(优化性能，只初始化一次) ======================
    private _statBasePos: cc.Vec2[] = [];
    private _statStarAlbumPos: cc.Vec2[] = [];
    private _statFreeBonusPos: cc.Vec2[] = [];
    private _statBingoPos: cc.Vec2[] = [];
    private _statDailyBlitzPos: cc.Vec2[] = [];

    // 初始化状态标记 - 懒加载，防止重复执行点位初始化
    private _isInit: boolean = false;

    // ====================== 生命周期回调 ======================
    protected onLoad(): void {
        this.initInfo();
    }

    // ====================== 核心初始化方法 ======================
    /**
     * 懒加载初始化所有属性点位坐标
     * 只执行一次，避免重复计算坐标，优化性能
     */
    private initInfo(): void {
        if (!this._isInit) {
            this._isInit = true;
            this.initPos(this.statBasePos, this._statBasePos);
            this.initPos(this.statStarAlbumPos, this._statStarAlbumPos);
            this.initPos(this.statFreeBonusPos, this._statFreeBonusPos);
            this.initPos(this.statBingoPos, this._statBingoPos);
            this.initPos(this.statDailyBlitzPos, this._statDailyBlitzPos);
        }
    }

    /**
     * 初始化单个属性的坐标点位缓存
     * @param nodeArr 编辑器绑定的节点数组(坐标参考)
     * @param posArr  缓存坐标的Vec2数组
     */
    private initPos(nodeArr: cc.Node[], posArr: cc.Vec2[]): void {
        // 初始化原点
        posArr.push(cc.Vec2.ZERO);
        // 遍历节点，存入对应世界坐标
        for (let i = 0; i < nodeArr.length; ++i) {
            posArr.push(nodeArr[i].getPosition());
        }
    }

    // ====================== 对外公开核心绘制方法 (HeroInfoPopup 调用此方法) ======================
    /**
     * 绘制指定英雄、指定等级的属性多边形轨迹图
     * @param heroId 英雄唯一标识 e.g: hero_cleopatra
     * @param level  英雄等级/阶级 e.g: 1,3,5
     */
    public drawStat(heroId: string, level: number): void {
        this.initInfo(); // 确保点位坐标已初始化
        
        // 获取英雄配置表数据
        const heroConfig = HeroManager.Instance().getHeroConfig(heroId);
        if (!heroConfig) {
            cc.error(`[HeroStatSetter] drawStat error -> 未找到英雄配置: ${heroId}`);
            return;
        }

        // 获取对应等级的英雄属性数据
        const heroStat = heroConfig.getHeroStat(level);
        if (!heroStat) {
            cc.error(`[HeroStatSetter] drawStat error -> 未找到英雄[${heroId}]等级[${level}]的属性数据`);
            return;
        }

        // 清空画布，准备绘制新的属性图形
        this.statGraphics.clear();

        // 根据属性值，计算出5个维度的绘制坐标点
        const posBase = this.getPosition(this._statBasePos, heroStat.base);
        const posStarAlbum = this.getPosition(this._statStarAlbumPos, heroStat.starAlbum);
        const posFreeBonus = this.getPosition(this._statFreeBonusPos, heroStat.freeBonus);
        const posBingo = this.getPosition(this._statBingoPos, heroStat.bingo);
        const posDailyBlitz = this.getPosition(this._statDailyBlitzPos, heroStat.dailyBlitz);

        // ========== 核心绘制逻辑：绘制五边形属性轨迹 ==========
        this.statGraphics.moveTo(posBase.x, posBase.y);        // 起点-基础属性
        this.statGraphics.lineTo(posStarAlbum.x, posStarAlbum.y); // 星级图鉴属性
        this.statGraphics.lineTo(posFreeBonus.x, posFreeBonus.y); // 免费奖励属性
        this.statGraphics.lineTo(posBingo.x, posBingo.y);      // 宾果属性
        this.statGraphics.lineTo(posDailyBlitz.x, posDailyBlitz.y); // 每日闪电战属性
        this.statGraphics.lineTo(posBase.x, posBase.y);        // 闭合图形-回到起点
        this.statGraphics.fill(); // 填充图形内部颜色
        this.statGraphics.stroke(); // 绘制图形描边轮廓
    }

    // ====================== 核心坐标计算工具方法 ======================
    /**
     * 根据属性数值，计算出对应的绘制坐标点
     * ✅ 原JS核心算法完全保留：偶数取值对应下标点位，奇数取相邻两个点位的**中点坐标**
     * @param posArr 该属性的所有参考坐标数组
     * @param value  该属性的具体数值
     * @returns 最终绘制的坐标点 Vec2
     */
    private getPosition(posArr: cc.Vec2[], value: number): cc.Vec2 {
        let targetPos = cc.v2(0, 0);
        const halfVal = Math.floor(value / 2);

        // 数值为奇数：取相邻两个坐标的中点
        if (value % 2 === 1) {
            const pos1 = posArr[halfVal];
            const pos2 = posArr[halfVal + 1];
            targetPos.x = (pos1.x + pos2.x) / 2;
            targetPos.y = (pos1.y + pos2.y) / 2;
        } 
        // 数值为偶数：直接取对应下标的坐标点
        else {
            targetPos = posArr[halfVal];
        }
        return targetPos;
    }
}