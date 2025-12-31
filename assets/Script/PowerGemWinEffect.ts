const { ccclass, property } = cc._decorator;

// 导入项目依赖的工具类/管理器（路径与原JS一致，无需修改）
import AsyncHelper from "./global_utility/AsyncHelper";
import TSUtility from "./global_utility/TSUtility";
import SlotManager from "./manager/SlotManager";

@ccclass('PowerGemWinEffect')
export default class PowerGemWinEffect extends cc.Component {
    // ===================== 动画名称常量 (与原JS完全一致) =====================
    public readonly ANIMATION_NAME_GAGE_NORMAL = "PowerGem_Gauge_Normal_Ani";
    public readonly ANIMATION_NAME_GAGE_COMPLETE = "PowerGem_Gauge_Ani";
    public readonly ANIMATION_NAME_GEM_REEL = "PowerGem_Gauge_Reel_Ani";
    public readonly ANIMATION_NAME_GAGE_UPGRADE_LOOP = "Upgrade_Txt_Ani";
    public readonly ANIMATION_NAME_GAGE_UPGRADE_COMPLETE = "PowerGem_Gauge_Upgrade_Ani";
    public readonly ANIMATION_NAME_GAGE_SKIP = "PowerGem_Gauge_Skip_Ani";

    // ===================== 数值常量 (与原JS完全一致) =====================
    public readonly MAX_SIZE = 553;
    public readonly MAX_MULTIPLE = 25;
    public readonly PLAY_STEP_1_TIME = 5;
    public readonly PLAY_STEP_2_TIME = 5.5;
    public readonly PROGRESS_MIN_TIME = 2.3;

    // ===================== 编辑器序列化属性 (可视化配置) =====================
    @property(cc.Animation)
    public ani: cc.Animation = null!;

    @property(cc.Sprite)
    public sprProgress: cc.Sprite = null!;

    @property(cc.Node)
    public nodeEffect: cc.Node = null!;

    @property(cc.Node)
    public nodeMask: cc.Node = null!;

    @property([cc.Node])
    public arrLevelGrade: cc.Node[] = [];

    @property([cc.Node])
    public arrResultGrade: cc.Node[] = [];

    // ===================== 私有内部状态属性 =====================
    private _isPlaying: boolean = false;
    private _isSkip: boolean = false;
    private _numDuration: number = 0;
    private _numCurTime: number = 0;
    public isUpgradeAction: boolean = false;
    public isStep2Complete: boolean = false;
    public numTargetProgress: number = 0;

    // ===================== 核心对外调用方法 - 第一步特效 =====================
    public async playPowerGemWinEffect_Step1(baseTime: number, targetMultiple: number, isSkip: boolean = false) {
        this.unscheduleAllCallbacks();
        this._numCurTime = 0;
        this.numTargetProgress = 0;
        this._isPlaying = false;
        this.isStep2Complete = false;

        // 初始化进度条/特效节点状态
        this.nodeEffect.active = true;
        this.sprProgress.fillRange = 0;
        this._numDuration = this.getProgressTime(baseTime, targetMultiple);
        this.nodeMask.setContentSize(0, this.nodeMask.height);
        this.nodeEffect.setPosition(0, this.nodeEffect.y);
        this._isSkip = isSkip;

        // 重置动画状态
        this.ani.stop();
        this.ani.setCurrentTime(0, this.ANIMATION_NAME_GAGE_COMPLETE);
        
        // 回调SlotManager设置奖励UI
        SlotManager.Instance.bigWinEffectInterface.setPowerGemRewardUI(this);

        // 计算目标进度值
        this.numTargetProgress = targetMultiple >= this.MAX_MULTIPLE ? 1 : targetMultiple / this.MAX_MULTIPLE;
        
        // 显示节点+播放对应动画
        this.node.active = true;
        const playAniName = this.isUpgradeAction ? this.ANIMATION_NAME_GAGE_UPGRADE_LOOP : this.ANIMATION_NAME_GAGE_NORMAL;
        this.ani.play(playAniName, 0);

        // 跳过模式下的透明度处理
        if (this._isSkip) {
            this.node.opacity = 0;
        } else {
            this._isPlaying = true;
        }
    }

    // ===================== 核心对外调用方法 - 第二步特效 =====================
    public async playPowerGemWinEffect_Step2() {
        if (!this.node.active) return;
        
        // 标记第一步完成，锁定进度条最终值
        this.setStep1Complete();

        // 跳过模式下延迟显示节点
        if (this._isSkip) {
            this.scheduleOnce(() => {
                this.node.opacity = 255;
            }, 0.5);
        } else {
            this.node.opacity = 255;
        }

        // 进度未满 直接返回 | 升级状态 直接返回
        if (this.numTargetProgress < 1 || this.isUpgradeAction) return;

        // 播放卷轴动画 + 等待指定时长后标记第二步完成
        this.ani.play(this.ANIMATION_NAME_GEM_REEL, 0);
        await AsyncHelper.delayWithComponent(this.PLAY_STEP_2_TIME, this);
        this.isStep2Complete = true;
    }

    // ===================== 进度条完成标记方法 =====================
    public setStep1Complete() {
        this._isPlaying = false;
        this.setProgress(this.numTargetProgress);
        this.nodeEffect.active = false;

        // 进度满时播放对应完成动画
        if (this.numTargetProgress >= 1) {
            const completeAni = this.isUpgradeAction ? this.ANIMATION_NAME_GAGE_UPGRADE_COMPLETE : this.ANIMATION_NAME_GAGE_COMPLETE;
            this.ani.play(completeAni, 0);
        }
    }

    // ===================== 第二步完成标记方法 =====================
    public setStep2Complete() {
        if (!this.isUpgradeAction) {
            this.ani.play(this.ANIMATION_NAME_GAGE_SKIP, 0);
        }
    }

    // ===================== 对外获取时长配置 =====================
    public getStep1Time(): number {
        return this.PLAY_STEP_1_TIME;
    }

    public getStep2Time(): number {
        return this.PLAY_STEP_2_TIME;
    }

    // ===================== 帧更新 - 进度条插值核心逻辑 =====================
    public update(dt: number) {
        if (!this._isPlaying) return;

        // 进度达标 直接完成
        if (this.sprProgress.fillRange >= this.numTargetProgress) {
            this.setStep1Complete();
            return;
        }

        // 累计时间 + 插值更新进度
        this._numCurTime += dt;
        this.setProgress(this._numCurTime / this._numDuration);
    }

    // ===================== 设置进度条核心方法 =====================
    public setProgress(rate: number) {
        // 进度条填充比例
        this.sprProgress.fillRange = cc.misc.lerp(0, 1, rate);
        // 更新遮罩节点宽度
        this.nodeMask.setContentSize(this.MAX_SIZE * this.sprProgress.fillRange, this.nodeMask.height);
        // 更新特效节点位置跟随进度条
        this.nodeEffect.setPosition(this.MAX_SIZE * this.sprProgress.fillRange, this.nodeEffect.y);
    }

    // ===================== 更新等级UI显示 =====================
    public setLevelUI(levelNum: number, gradeIdx: number) {
        this.arrLevelGrade.forEach(levelNode => {
            if (!TSUtility.isValid(levelNode)) return;
            
            // 显示对应等级的子节点
            levelNode.children.forEach((child, idx) => {
                if (TSUtility.isValid(child)) {
                    child.active = idx === gradeIdx - 1;
                }
            });

            // 更新等级文本
            const levelLabelNode = levelNode.getChildByName("Font_Level");
            if (TSUtility.isValid(levelLabelNode)) {
                const levelLabel = levelLabelNode.getComponent(cc.Label);
                if (TSUtility.isValid(levelLabel)) {
                    levelLabelNode.active = true;
                    levelLabel.string = levelNum.toString();
                }
            }
        });
    }

    // ===================== 计算进度条播放时长 (带最小值限制) =====================
    public getProgressTime(baseTime: number, multiple: number): number {
        if (multiple < 25) return baseTime;
        
        const calcTime = baseTime / multiple * 25;
        return calcTime <= this.PROGRESS_MIN_TIME ? this.PROGRESS_MIN_TIME : calcTime;
    }
}