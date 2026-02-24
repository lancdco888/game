import BeeLovedJarsManager from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏特色奖金展示组件
 * 负责奖金UI的初始化、显示/隐藏、奖金累加、金额格式化显示、特效动画播放
 */
@ccclass('FeaturePrizeComponent_BellLovedJars')
export default class FeaturePrizeComponent_BellLovedJars extends cc.Component {
    // ===================== 核心UI/动画组件 =====================
    // 奖金金额显示标签
    @property({
        type: cc.Label,
        displayName: "奖金显示标签",
        tooltip: "显示累加后的总奖金金额（格式化后）"
    })
    prize_Label: cc.Label | null = null;

    // 奖金特效动画组件
    @property({
        type: cc.Animation,
        displayName: "奖金特效动画",
        tooltip: "控制奖金UI出现/更新的特效动画组件"
    })
    target_Ani: cc.Animation | null = null;

    // 需要重置尺寸的节点数组（初始化时设为34x34）
    @property({
        type: [cc.Node],
        displayName: "尺寸重置节点数组",
        tooltip: "初始化时需要将宽高设为34x34的节点数组"
    })
    size_Nodes: cc.Node[] | null = [];

    // 需要重置透明度的节点数组（初始化时设为0）
    @property({
        type: [cc.Node],
        displayName: "透明度重置节点数组",
        tooltip: "初始化时需要将透明度设为0的节点数组"
    })
    opacity_Nodes: cc.Node[] | null = [];

    // ===================== 私有状态变量 =====================
    // 累计总奖金
    private _totalPrize: number = 0;

    /**
     * 初始化奖金UI：重置尺寸/透明度节点的状态
     */
    init(): void {
        // 1. 重置尺寸节点：宽高设为34x34
        if (this.size_Nodes && this.size_Nodes.length > 0) {
            this.size_Nodes.forEach((node: cc.Node) => {
                if (node && node.isValid) {
                    node.width = 34;
                    node.height = 34;
                }
            });
        }

        // 2. 重置透明度节点：透明度设为0
        if (this.opacity_Nodes && this.opacity_Nodes.length > 0) {
            this.opacity_Nodes.forEach((node: cc.Node) => {
                if (node && node.isValid) {
                    node.opacity = 0;
                }
            });
        }
    }

    /**
     * 显示奖金UI：重置状态+激活节点+播放出现动画
     */
    showUI(): void {
        // 1. 重置累计奖金为0
        this._totalPrize = 0;

        // 2. 初始化UI状态
        this.init();

        // 3. 激活组件节点
        this.node.active = true;

        // 4. 清空奖金标签显示
        if (this.prize_Label) {
            this.prize_Label.string = "";
        }

        // 5. 播放奖金UI出现动画
        if (this.target_Ani && this.target_Ani.isValid) {
            this.target_Ani.play("Fx_Fs_bottom_result_appear", 0); // 0=不循环
        }
    }

    /**
     * 累加奖金并更新显示（注意：原代码方法名拼写为addPrzie，保留以兼容调用）
     * @param prize 本次要累加的奖金金额
     */
    addPrzie(prize: number): void {
        // 1. 播放奖金更新特效动画
        if (this.target_Ani && this.target_Ani.isValid) {
            this.target_Ani.play("Fx_Fs_bottom_result", 0); // 0=不循环
        }

        // 2. 累加奖金（原代码冗余的this._totalPrize;语句已注释，不影响逻辑）
        this._totalPrize += prize;
        const total = this._totalPrize;

        // 3. 格式化并更新奖金标签
        if (this.prize_Label) {
            const gameManager = BeeLovedJarsManager.getInstance();
            // 空值检查：确保格式化方法存在，兜底显示原始数字
            if (gameManager?.game_components?.formatEllipsisNumber) {
                this.prize_Label.string = gameManager.game_components.formatEllipsisNumber(total);
            } else {
                this.prize_Label.string = total.toString();
                console.warn("formatEllipsisNumber方法未找到，使用默认数字格式");
            }
        }
    }

    /**
     * 隐藏奖金UI：禁用组件节点
     */
    hideUI(): void {
        this.node.active = false;
    }
}