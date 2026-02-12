import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属奖励元素组件
 * 核心功能：奖励卡片交互（鼠标悬停/离开）、多状态显示（普通/奖励/结束）、动画播放、数值累加
 */
@ccclass()
export default class BonusEleComponent_SuperSevenBlasts extends cc.Component {
    // ========== 编辑器配置属性 ==========
    /** 卡片根节点 */
    @property({
        type: cc.Node,
        displayName: "卡片节点",
        tooltip: "奖励卡片的根节点（包含翻转动画）"
    })
    public card_Node: cc.Node = null;

    /** 普通状态节点 */
    @property({
        type: cc.Node,
        displayName: "普通状态节点",
        tooltip: "显示普通奖励的节点"
    })
    public normal_Node: cc.Node = null;

    /** 奖励状态节点 */
    @property({
        type: cc.Node,
        displayName: "奖励状态节点",
        tooltip: "显示Bonus奖励的节点"
    })
    public bonus_Node: cc.Node = null;

    /** 结束状态节点 */
    @property({
        type: cc.Node,
        displayName: "结束状态节点",
        tooltip: "显示结束状态的节点"
    })
    public end_Node: cc.Node = null;

    /** 数值显示标签 */
    @property({
        type: cc.Label,
        displayName: "数值标签",
        tooltip: "显示奖励数值的Label组件"
    })
    public amount_Label: cc.Label = null;

    /** 普通状态动画节点 */
    @property({
        type: cc.Node,
        displayName: "普通动画节点",
        tooltip: "承载普通状态动画的节点"
    })
    public normalAni_Node: cc.Node = null;

    /** 奖励状态动画节点 */
    @property({
        type: cc.Node,
        displayName: "奖励动画节点",
        tooltip: "承载奖励状态动画的节点"
    })
    public bonusAni_Node: cc.Node = null;

    /** 结束状态动画节点 */
    @property({
        type: cc.Node,
        displayName: "结束动画节点",
        tooltip: "承载结束状态动画的节点"
    })
    public endAni_Node: cc.Node = null;

    /** 需要初始化缩放的节点数组 */
    @property({
        type: [cc.Node],
        displayName: "缩放初始化节点",
        tooltip: "显示前需要重置缩放为0的节点列表"
    })
    public scaleInit_Nodes: cc.Node[] = [];

    /** 需要初始化激活状态的节点数组 */
    @property({
        type: [cc.Node],
        displayName: "激活初始化节点",
        tooltip: "显示前需要设置为非激活的节点列表"
    })
    public activeInit_Nodes: cc.Node[] = [];

    /** 卡片索引 */
    @property({
        displayName: "卡片索引",
        tooltip: "标识当前卡片的索引值"
    })
    public cardIndex: number = 0;

    // ========== 状态属性 ==========
    /** 当前奖励数值 */
    private _currentValue: number = 0;
    /** 是否启用交互 */
    public _isEnable: boolean = true;
    /** 是否已打开（显示内容） */
    private _isOpend: boolean = false;
    /** 鼠标进入回调 */
    private _enterFunc: ((cardIndex: number) => void) | null = null;
    /** 鼠标离开回调 */
    private _leaveFunc: (() => void) | null = null;

    // ========== 生命周期 ==========
    protected onLoad(): void {
        // 绑定鼠标进入/离开事件
        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            // 卡片缩放放大
            if (TSUtility.isValid(this.card_Node)) {
                this.card_Node.scale = 1.1;
            }
            // 执行鼠标进入回调（未打开状态）
            if (TSUtility.isValid(this._enterFunc) && !this._isOpend) {
                this._enterFunc(this.cardIndex);
            }
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            // 恢复卡片缩放
            if (TSUtility.isValid(this.card_Node)) {
                this.card_Node.scale = 1;
            }
            // 执行鼠标离开回调（未打开状态）
            if (TSUtility.isValid(this._leaveFunc) && !this._isOpend) {
                this._leaveFunc();
            }
        }, this);
    }

    // ========== 初始化 ==========
    /**
     * 初始化卡片状态
     * @param enterFunc 鼠标进入回调
     * @param leaveFunc 鼠标离开回调
     */
    public init(enterFunc?: (cardIndex: number) => void, leaveFunc?: () => void): void {
        // 启用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = true;
        }

        // 重置卡片缩放
        if (TSUtility.isValid(this.card_Node)) {
            this.card_Node.scale = 1;
            this.card_Node.active = true;
            // 播放卡片背面待机动画
            const cardAni = this.card_Node.getComponent(cc.Animation);
            if (cardAni) {
                cardAni.play("B_Sym_card_back_Stay");
            }
        }

        // 隐藏所有状态节点
        if (TSUtility.isValid(this.normal_Node)) this.normal_Node.active = false;
        if (TSUtility.isValid(this.bonus_Node)) this.bonus_Node.active = false;
        if (TSUtility.isValid(this.end_Node)) this.end_Node.active = false;

        // 重置状态
        this._isOpend = false;
        this._isEnable = true;
        this._enterFunc = enterFunc || null;
        this._leaveFunc = leaveFunc || null;
        this._currentValue = 0;
    }

    // ========== 普通状态显示 ==========
    /**
     * 显示普通奖励状态
     * @param value 奖励数值
     * @param isDim 是否为暗态显示（默认false）
     */
    public showNormal(value: number, isDim: boolean = false): void {
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isOpend = true;

        // 处理卡片显示/翻转动画
        if (TSUtility.isValid(this.card_Node)) {
            if (isDim) {
                this.card_Node.active = true;
                const cardAni = this.card_Node.getComponent(cc.Animation);
                if (cardAni) {
                    cardAni.play("B_Sym_card_back_flip");
                    cardAni.setCurrentTime(0);
                }
            } else {
                this.card_Node.active = false;
            }
        }

        // 设置奖励数值
        if (TSUtility.isValid(this.amount_Label)) {
            this.amount_Label.string = value.toString();
        }
        this._currentValue = value;

        // 重置初始化节点状态
        this.scaleInit_Nodes.forEach(node => {
            if (TSUtility.isValid(node)) node.scale = 0;
        });
        this.activeInit_Nodes.forEach(node => {
            if (TSUtility.isValid(node)) node.active = false;
        });

        // 显示普通状态并播放动画
        const showNormalContent = () => {
            if (TSUtility.isValid(this.normal_Node)) {
                this.normal_Node.active = true;
            }
            // 选择对应动画
            let aniName = "B_sym_7_red_appear";
            if (isDim) {
                aniName = "B_sym_7_red_Dim_end_sym";
            }
            // 播放普通状态动画
            if (TSUtility.isValid(this.normalAni_Node)) {
                const normalAni = this.normalAni_Node.getComponent(cc.Animation);
                if (normalAni) {
                    normalAni.play(aniName);
                }
            }
        };

        // 暗态模式延迟显示
        if (isDim) {
            this.scheduleOnce(showNormalContent, 0.55);
        } else {
            showNormalContent();
        }
    }

    /**
     * 累加普通奖励数值
     * @param addValue 要累加的数值
     */
    public addNormal(addValue: number): void {
        this._currentValue += addValue;
        if (TSUtility.isValid(this.amount_Label)) {
            this.amount_Label.string = this._currentValue.toString();
        }
    }

    // ========== 奖励状态显示 ==========
    /**
     * 显示Bonus奖励状态
     * @param isDim 是否为暗态显示（默认false）
     */
    public showBonus(isDim: boolean = false): void {
        // 取消所有未执行的调度器
        this.unscheduleAllCallbacks();
        
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isOpend = true;

        // 重置缩放初始化节点
        this.scaleInit_Nodes.forEach(node => {
            if (TSUtility.isValid(node)) node.scale = 0;
        });

        // 处理卡片显示/翻转动画
        if (TSUtility.isValid(this.card_Node)) {
            if (isDim) {
                this.card_Node.active = true;
                const cardAni = this.card_Node.getComponent(cc.Animation);
                if (cardAni) {
                    cardAni.play("B_Sym_card_back_flip");
                    cardAni.setCurrentTime(0);
                }
            } else {
                this.card_Node.active = false;
            }
        }

        // 显示奖励状态并播放动画
        const showBonusContent = () => {
            if (TSUtility.isValid(this.bonus_Node)) {
                this.bonus_Node.active = true;
            }
            // 选择对应动画
            let aniName = "B_sym_7_gold_appear";
            if (isDim) {
                aniName = "B_sym_7_gold_Dim_appear";
            }
            // 播放奖励状态动画
            if (TSUtility.isValid(this.bonusAni_Node)) {
                const bonusAni = this.bonusAni_Node.getComponent(cc.Animation);
                if (bonusAni) {
                    bonusAni.play(aniName);
                }
            }
        };

        // 暗态模式延迟显示
        if (isDim) {
            this.scheduleOnce(showBonusContent, 0.55);
        } else {
            showBonusContent();
        }
    }

    /**
     * 播放奖励移动动画
     */
    public moveBonus(): void {
        if (TSUtility.isValid(this.bonusAni_Node)) {
            const bonusAni = this.bonusAni_Node.getComponent(cc.Animation);
            if (bonusAni) {
                bonusAni.play("B_sym_7_gold_appear");
            }
        }
    }

    /**
     * 播放扩展奖励移动动画（带音效）
     */
    public exMoveBonus(): void {
        if (TSUtility.isValid(this.bonusAni_Node)) {
            const bonusAni = this.bonusAni_Node.getComponent(cc.Animation);
            if (bonusAni) {
                bonusAni.play("B_sym_7_gold_ex");
            }
        }
        // 播放奖励期望音效
        SlotSoundController.Instance().playAudio("BonusExpect", "FX");
    }

    // ========== 结束状态显示 ==========
    /**
     * 显示结束状态
     * @param isDim 是否为暗态显示（默认false）
     */
    public showEnd(isDim: boolean = false): void {
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isOpend = true;

        // 重置缩放初始化节点
        this.scaleInit_Nodes.forEach(node => {
            if (TSUtility.isValid(node)) node.scale = 0;
        });

        // 处理卡片显示/翻转动画
        if (TSUtility.isValid(this.card_Node)) {
            if (isDim) {
                this.card_Node.active = true;
                const cardAni = this.card_Node.getComponent(cc.Animation);
                if (cardAni) {
                    cardAni.play("B_Sym_card_back_flip");
                    cardAni.setCurrentTime(0);
                }
            } else {
                this.card_Node.active = false;
            }
        }

        // 显示结束状态并播放动画
        const showEndContent = () => {
            if (TSUtility.isValid(this.end_Node)) {
                this.end_Node.active = true;
                // 暗态模式设置透明度，普通模式恢复不透明
                if (!isDim) {
                    this.end_Node.opacity = 255;
                }
            }
            // 选择对应动画
            let aniName = "B_sym_end_appear";
            if (isDim) {
                aniName = "B_sym_end_Dim_appear";
            }
            // 播放结束状态动画
            if (TSUtility.isValid(this.endAni_Node)) {
                const endAni = this.endAni_Node.getComponent(cc.Animation);
                if (endAni) {
                    endAni.play(aniName);
                }
            }
        };

        // 暗态模式延迟显示
        if (isDim) {
            this.scheduleOnce(showEndContent, 0.55);
        } else {
            showEndContent();
        }
    }

    // ========== 状态强制设置 ==========
    /**
     * 强制设置为卡片背面状态
     */
    public setCard(): void {
        if (TSUtility.isValid(this.card_Node)) {
            this.card_Node.scale = 1;
            this.card_Node.active = true;
            // 播放卡片背面待机动画
            const cardAni = this.card_Node.getComponent(cc.Animation);
            if (cardAni) {
                cardAni.play("B_Sym_card_back_Stay");
                cardAni.setCurrentTime(0);
            }
        }
        // 隐藏所有内容节点
        if (TSUtility.isValid(this.bonus_Node)) this.bonus_Node.active = false;
        if (TSUtility.isValid(this.end_Node)) this.end_Node.active = false;
        if (TSUtility.isValid(this.normal_Node)) this.normal_Node.active = false;
    }

    /**
     * 强制设置为普通状态
     * @param value 奖励数值
     * @param isEnable 是否启用（默认true）
     */
    public setNormal(value: number, isEnable: boolean = true): void {
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isOpend = true;
        this._isEnable = isEnable;

        // 隐藏非普通状态节点
        if (TSUtility.isValid(this.card_Node)) this.card_Node.active = false;
        if (TSUtility.isValid(this.bonus_Node)) this.bonus_Node.active = false;
        if (TSUtility.isValid(this.end_Node)) this.end_Node.active = false;
        // 显示普通状态节点
        if (TSUtility.isValid(this.normal_Node)) this.normal_Node.active = true;

        // 设置奖励数值
        if (TSUtility.isValid(this.amount_Label)) {
            this.amount_Label.node.parent.active = true;
            this.amount_Label.string = value === 0 ? "" : value.toString();
        }
        this._currentValue = value;

        // 播放对应动画
        if (TSUtility.isValid(this.normalAni_Node)) {
            const normalAni = this.normalAni_Node.getComponent(cc.Animation);
            if (normalAni) {
                if (value === 0) {
                    // 数值为0时设置动画到指定时间点
                    normalAni.setCurrentTime(1, "B_sym_7_red_Dim_appear");
                } else {
                    // 播放普通状态待机动画
                    normalAni.play("B_sym_7_red_stay");
                }
            }
        }
    }

    /**
     * 切换为奖励暗态
     */
    public changeBonus(): void {
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isEnable = false;

        // 隐藏非奖励状态节点
        if (TSUtility.isValid(this.card_Node)) this.card_Node.active = false;
        if (TSUtility.isValid(this.end_Node)) this.end_Node.active = false;
        if (TSUtility.isValid(this.normal_Node)) this.normal_Node.active = false;
        // 显示奖励状态节点
        if (TSUtility.isValid(this.bonus_Node)) this.bonus_Node.active = true;

        // 播放奖励暗态动画
        if (TSUtility.isValid(this.bonusAni_Node)) {
            const bonusAni = this.bonusAni_Node.getComponent(cc.Animation);
            if (bonusAni) {
                bonusAni.play("B_sym_7_gold_Dimmed");
            }
        }
    }

    /**
     * 强制设置为奖励状态
     * @param isDim 是否为暗态（默认false）
     */
    public setBonus(isDim: boolean = false): void {
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isOpend = true;

        // 隐藏非奖励状态节点
        if (TSUtility.isValid(this.card_Node)) this.card_Node.active = false;
        if (TSUtility.isValid(this.end_Node)) this.end_Node.active = false;
        if (TSUtility.isValid(this.normal_Node)) this.normal_Node.active = false;
        // 显示奖励状态节点
        if (TSUtility.isValid(this.bonus_Node)) this.bonus_Node.active = true;

        // 设置结束节点透明度（暗态）
        if (TSUtility.isValid(this.end_Node)) {
            this.end_Node.opacity = isDim ? 180 : 255;
        }

        // 播放奖励待机动画
        if (TSUtility.isValid(this.bonusAni_Node)) {
            const bonusAni = this.bonusAni_Node.getComponent(cc.Animation);
            if (bonusAni) {
                bonusAni.play("B_sym_7_gold_Stay");
            }
        }
    }

    /**
     * 强制设置为结束状态
     */
    public setEnd(): void {
        // 禁用按钮交互
        const buttonComp = this.node.getComponent(cc.Button);
        if (buttonComp) {
            buttonComp.interactable = false;
        }
        this._isOpend = true;

        // 隐藏非结束状态节点
        if (TSUtility.isValid(this.card_Node)) this.card_Node.active = false;
        if (TSUtility.isValid(this.bonus_Node)) this.bonus_Node.active = false;
        if (TSUtility.isValid(this.normal_Node)) this.normal_Node.active = false;
        // 显示结束状态节点
        if (TSUtility.isValid(this.end_Node)) this.end_Node.active = true;
    }

    // ========== 卡片动画控制 ==========
    /**
     * 播放卡片震动动画
     */
    public shakeCard(): void {
        if (TSUtility.isValid(this.card_Node)) {
            this.card_Node.scale = 1;
            const cardAni = this.card_Node.getComponent(cc.Animation);
            if (cardAni) {
                cardAni.play("B_Sym_card_back");
                cardAni.setCurrentTime(0);
            }
        }
    }

    /**
     * 停止卡片动画并恢复待机状态
     */
    public stopCard(): void {
        if (TSUtility.isValid(this.card_Node)) {
            this.card_Node.scale = 1;
            const cardAni = this.card_Node.getComponent(cc.Animation);
            if (cardAni) {
                cardAni.play("B_Sym_card_back_Stay");
                cardAni.setCurrentTime(0);
            }
        }
    }
}