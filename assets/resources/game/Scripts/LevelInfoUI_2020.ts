import ServiceInfoManager from "../../../Script/ServiceInfoManager";
import UserInfo from "../../../Script/User/UserInfo";
import LevelManager from "../../../Script/manager/LevelManager";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;

/**
 * 等级信息显示组件（LevelInfoUI_2020）
 * 负责等级数值、经验进度条的显示与动画，Booster倍数（x2/x3）节点控制
 */
@ccclass()
export default class LevelInfoUI_2020 extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Label)
    public levelInfoLabel: cc.Label = null; // 等级显示标签

    @property(cc.ProgressBar)
    public progressBar: cc.ProgressBar  = null; // 经验进度条

    @property(cc.Node)
    public x2_Node: cc.Node = null; // x2倍数显示节点

    @property(cc.Node)
    public x3_Node: cc.Node = null; // x3倍数显示节点

    // ================= 私有状态变量 =================
    private _startExp: number = 0; // 动画起始经验值
    private _targetExp: number = 0; // 动画目标经验值
    private _startTime: number = 0; // 动画开始时间戳
    private _duration: number = 0.4; // 动画持续时间（秒）
    private _prevPercent: number = 0; // 上一次进度百分比
    private _prevLevel: number = 0; // 上一次等级

    // ================= 生命周期函数 =================
    onLoad() {
        // 原代码空实现，保留以兼容子类扩展
    }

    start() {
        // 初始化等级信息
        this.initLevelInfo();
    }

    onDestroy() {
        // 移除所有事件监听，避免内存泄漏
        UserInfo.instance().removeListenerTargetAll(this);
    }

    onEnable() {
        // 组件启用时显示UI
        this.setOnOff(true);
    }

    onDisable() {
        // 组件禁用时隐藏UI
        this.setOnOff(false);
    }

    // ================= 核心业务逻辑 =================
    /**
     * 控制UI显示/隐藏
     * @param isShow 是否显示
     */
    public setOnOff(isShow: boolean): void {
        this.node.active = isShow;
        if (this.progressBar) {
            this.progressBar.node.active = isShow;
        }
    }

    /**
     * 初始化等级和经验条信息
     */
    public initLevelInfo(): void {
        if (!this.levelInfoLabel) {
            cc.log("LevelInfoUI_2020: levelInfoLabel 未配置");
            return;
        }

        // 显示等级标签，初始化经验值和进度
        this.levelInfoLabel.node.active = true;
        this._startExp = ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP;
        this._targetExp = this._startExp;
        this._prevPercent = 0;
        this._prevLevel = ServiceInfoManager.instance.getUserLevel();
        
        // 设置初始经验条进度
        this.setLevelGague(ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP);
    }

    /**
     * 增加经验值并播放进度条动画
     * @param addExp 要增加的经验值
     */
    public addLevelInfo(addExp: number): void {
        // 记录动画开始时间、起始/目标经验值
        this._startTime = Date.now();
        this._startExp = ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP;
        this._targetExp = this._startExp + addExp;
        
        // 启动进度条更新调度（每一帧更新）
        this.schedule(this.updateGague, 0);
    }

    /**
     * 设置等级和经验条进度
     * @param currentExp 当前经验值
     */
    public setLevelGague(currentExp: number): void {
        if (!this.progressBar || !this.levelInfoLabel) {
            cc.log("LevelInfoUI_2020: progressBar/levelInfoLabel 未配置");
            return;
        }

        // 计算经验进度百分比（0-1）
        let expPercent = LevelManager.Instance().getLevelExpPercent(currentExp);
        expPercent = Math.min(1, expPercent);
        
        // 获取当前等级
        const currentLevel = LevelManager.Instance().getLevelFromExp(currentExp);
        
        // 进度保底：避免进度条完全为空（最小0.1）
        const displayPercent = expPercent === 0 ? 0 : (expPercent < 0.1 ? 0.1 : expPercent);

        // 更新服务层等级、UI显示
        ServiceInfoManager.instance.setUserLevel(currentLevel);
        this.levelInfoLabel.string = currentLevel.toString();
        this.progressBar.progress = displayPercent;

        // 记录上一次的进度和等级
        this._prevPercent = displayPercent;
        this._prevLevel = currentLevel;
    }

    /**
     * 帧更新经验条动画（缓动 lerp）
     */
    private updateGague(): void {
        // 计算动画进度（0-1）
        const elapsedTime = (Date.now() - this._startTime) / 1000; // 转换为秒
        let t = elapsedTime / this._duration;
        t = Math.min(1, t); // 限制最大进度为1

        // 线性插值计算当前经验值
        const currentExp = cc.misc.lerp(this._startExp, this._targetExp, t);
        
        // 更新等级和进度条
        this.setLevelGague(currentExp);

        // 动画完成：取消调度
        if (t === 1) {
            this.unschedule(this.updateGague);
        }
    }

    /**
     * 设置Booster倍数显示（x2/x3）
     * @param boosterValue 倍数（2/x3）
     */
    public setBoosterInfo(boosterValue: number): void {
        // 显示x2节点（倍数为2），隐藏x3
        if (this.x2_Node) {
            this.x2_Node.active = boosterValue === 2;
        }
        // 显示x3节点（倍数非2），隐藏x2
        if (this.x3_Node) {
            this.x3_Node.active = boosterValue !== 2;
        }
    }
}