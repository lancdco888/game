import UserInfo from "../../../Script/User/UserInfo";
import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import HeroManager from "../../../Script/manager/HeroManager";

const { ccclass, property } = cc._decorator; // 沿用指定的装饰器导出方式


/**
 * 游戏内英雄奖励通用图标组件（CommonRewardInGameHeroIcon）
 * 负责英雄战力收集动画、经验进度条更新、等级提升视觉反馈
 */
@ccclass()
export default class CommonRewardInGameHeroIcon extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Animation)
    public aniHeroIcon: cc.Animation = null; // 英雄图标动画组件

    @property(cc.Animation)
    public aniProgress: cc.Animation = null; // 进度条动画组件

    @property(cc.Label)
    public lblCurForce: cc.Label  = null; // 当前战力标签

    @property(cc.Label)
    public lblMaxForce: cc.Label = null; // 最大战力标签

    @property(cc.Sprite)
    public sprForceProgressBar: cc.Sprite = null; // 战力进度条精灵

    @property(cc.Sprite)
    public sprForceAddProgressBar: cc.Sprite = null; // 战力增加进度条精灵

    @property(cc.Node)
    public nodeForceLabel: cc.Node = null; // 战力标签根节点

    @property(cc.Node)
    public nodeForceMax: cc.Node = null; // 战力满值标签根节点

    // ================= 私有状态属性 =================
    private _numForceCount: number = 0; // 战力收集数量
    private _numHeroPrevLevel: number = 0; // 英雄升级前等级
    private _numHeroPrevForce: number = 0; // 英雄升级前战力
    private _numHeroNextLevel: number = 0; // 英雄升级后等级
    private _numHeroNextForce: number = 0; // 英雄升级后战力
    private _isHeroRankUp: boolean = false; // 是否英雄等级提升（RankUp）
    private _numStartTime: number = 0; // 进度更新开始时间（时间戳）
    private _numStartExp: number = 0; // 进度更新开始经验值
    private _numTargetExp: number = 0; // 进度更新目标经验值
    private _numDuration: number = 1; // 进度更新持续时间（秒）

    // ================= 核心业务逻辑 =================
    /**
     * 播放战力收集动画
     * @param forceCount 收集的战力数量
     * @returns Promise<void>
     */
    public async playCollectForceAction(forceCount: number): Promise<void> {
        // 战力数量≤0 或 用户英雄信息无效时直接返回
        if (forceCount <= 0) return;
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        if (!TSUtility.isValid(userHeroInfo)) return;

        // 记录战力收集数量 + 获取当前激活英雄信息
        this._numForceCount = forceCount;
        const activeHeroID = userHeroInfo.activeHeroID;
        const heroInfo = userHeroInfo.getHeroInfo(activeHeroID);
        if (!TSUtility.isValid(heroInfo)) return;

        // 记录升级前的等级/战力
        this._numHeroPrevLevel = heroInfo.rank;
        this._numHeroPrevForce = heroInfo.force;

        // 增加英雄经验 + 记录升级后的等级/战力
        UserInfo.instance().addHeroExp(activeHeroID, this._numForceCount);
        this._numHeroNextLevel = userHeroInfo.getHeroLevel(activeHeroID);
        this._numHeroNextForce = userHeroInfo.getHeroInfo(activeHeroID).force;

        // 判断是否等级提升
        this._isHeroRankUp = this._numHeroPrevLevel !== this._numHeroNextLevel;

        // 播放英雄图标动画（等级提升/普通收集区分）
        this.aniHeroIcon!.play(
            this._isHeroRankUp ? "Hero_Icon_ForceIn_RankUp" : "Hero_Icon_ForceIn"
        );

        // 播放战力增加动画
        this.playAddForceAction();

        // 等待动画完成（等级提升等待1.95秒，普通收集等待0.5秒）
        await AsyncHelper.delayWithComponent(
            this._isHeroRankUp ? 1.95 : 0.5, 
            this
        );
    }

    /**
     * 播放战力增加动画（初始化进度条 + 启动进度更新）
     */
    public playAddForceAction(): void {
        // 取消旧的进度更新调度
        this.unschedule(this.updatePowerExpGague);

        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        if (!TSUtility.isValid(userHeroInfo)) return;

        const activeHeroID = userHeroInfo.activeHeroID;
        // 获取英雄当前等级的最小/最大经验值
        const minExp = HeroManager.Instance().getHeroLevelMinExp(activeHeroID, this._numHeroPrevForce);
        const nextExp = HeroManager.Instance().getHeroLevelNextExp(activeHeroID, this._numHeroPrevForce);
        
        // 计算当前经验值（相对值）
        const currentExp = this._numHeroPrevForce - minExp;
        const maxExp = nextExp - minExp;

        // 更新战力标签显示
        this.lblCurForce!.string = currentExp.toString();
        this.lblMaxForce!.string = maxExp.toString();

        // 播放进度条动画（等级提升/普通收集区分）
        this.aniProgress!.stop();
        this.aniProgress!.play(
            this._isHeroRankUp ? "RankGauge_Full" : "RankGauge"
        );
        this.aniProgress!.setCurrentTime(0);

        // 初始化进度更新参数 + 启动实时更新调度
        this._numStartTime = Date.now();
        this._numStartExp = this._numHeroPrevForce;
        this._numTargetExp = this._numHeroNextForce;
        this.schedule(this.updatePowerExpGague, 0);
    }

    /**
     * 实时更新战力进度条（插值计算当前值）
     */
    public updatePowerExpGague(): void {
        // 计算时间插值（0~1）
        const timeLerp = Math.min(
            1, 
            (Date.now() - this._numStartTime) / (this._numDuration * 1000)
        );

        // 插值计算当前战力值
        const currentForce = cc.misc.lerp(
            this._numStartExp, 
            this._numTargetExp, 
            timeLerp
        );

        // 更新进度条显示
        this.setForceProgress(currentForce, true);

        // 进度完成后取消调度
        if (timeLerp === 1) {
            this.unschedule(this.updatePowerExpGague);
        }
    }

    /**
     * 设置战力进度条显示
     * @param forceValue 当前战力值
     * @param isAddForce 是否为战力增加过程（影响数值取整）
     */
    public setForceProgress(forceValue: number, isAddForce: boolean = false): void {
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        if (!TSUtility.isValid(userHeroInfo)) return;

        const activeHeroID = userHeroInfo.activeHeroID;
        // 获取当前战力对应的等级最小/最大经验值
        const minExp = HeroManager.Instance().getHeroLevelMinExp(activeHeroID, forceValue);
        const nextExp = HeroManager.Instance().getHeroLevelNextExp(activeHeroID, forceValue);
        // 计算进度百分比
        var expPercent = HeroManager.Instance().getHeroExpPercent(activeHeroID, forceValue);

        // 战力值取整（增加过程加0.2优化视觉效果）
        const roundedForce = isAddForce 
            ? Math.floor(forceValue + 0.2) 
            : Math.floor(forceValue);

        // 处理等级提升满值情况
        const isFullExp = (roundedForce - minExp) === (nextExp - minExp);
        if (expPercent === 0 && this._isHeroRankUp || isFullExp) {
            // 满值：进度100%，隐藏普通标签，显示满值标签
            expPercent = 1;
            this.nodeForceLabel!.active = false;
            this.nodeForceMax!.active = true;
        } else {
            // 非满值：显示普通标签，隐藏满值标签
            this.nodeForceLabel!.active = true;
            this.nodeForceMax!.active = false;
            
            // 更新当前/最大战力标签
            if (this.lblCurForce) {
                this.lblCurForce.string = (roundedForce - minExp).toString();
            }
            if (this.lblMaxForce) {
                this.lblMaxForce.string = (nextExp - minExp).toString();
            }
        }

        // 控制进度条显示
        if (expPercent === 0) {
            this.sprForceProgressBar!.node.active = false;
            this.sprForceAddProgressBar!.node.active = false;
        } else {
            this.sprForceProgressBar!.node.active = true;
            this.sprForceAddProgressBar!.node.active = true;
            
            // 计算进度条宽度（基础25 + 166*百分比）
            const progressWidth = 25 + 166 * expPercent;
            this.sprForceProgressBar!.node.width = progressWidth;
            this.sprForceAddProgressBar!.node.width = progressWidth;
        }
    }
}