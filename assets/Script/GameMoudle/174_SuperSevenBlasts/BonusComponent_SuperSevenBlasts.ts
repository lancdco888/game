import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import State, { SequencialState } from "../../Slot/State";
import { BottomTextType } from "../../SubGame/BottomUIText";
import GameComponents_Base from "../../game/GameComponents_Base";
import TSUtility from "../../global_utility/TSUtility";
import ServicePopupManager from "../../manager/ServicePopupManager";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";
import BonusEleComponent_SuperSevenBlasts from "./BonusEleComponent_SuperSevenBlasts";
import MoveBonusGameComponent_SuperSevenBlasts from "./MoveBonusGameComponent_SuperSevenBlasts";
import SuperSevenBlastsManager from "./SuperSevenBlastsManager";

const { ccclass, property } = cc._decorator;

/**
 * Bonus信息模型（SuperSevenBlasts游戏专属）
 * 管理Bonus的key、奖励值、奖励单位（sevenCount/superStar/end）
 */
export class BonusInfo_SuperSevenBlasts {
    /** Bonus唯一标识 */
    public key: number = -1;
    /** 奖励数值 */
    public prize: number = 0;
    /** 奖励单位类型：sevenCount/superStar/end */
    public prizeUnit: string = "";

    /**
     * 初始化Bonus数据
     * @param key Bonus标识
     */
    public initData(key: number): void {
        this.key = key;
        this.prize = 0;

        // 根据key设置奖励数值
        if (key === 1) {
            this.prize = 10;
        } else if (key < 4) {
            this.prize = 3;
        } else if (key < 7) {
            this.prize = 2;
        } else if (key < 20) {
            this.prize = 1;
        }

        // 设置奖励单位
        if (key < 20) {
            this.prizeUnit = "sevenCount";
        } else if (key < 30) {
            this.prizeUnit = "superStar";
        } else {
            this.prizeUnit = "end";
        }
    }

    /**
     * 创建BonusInfo实例
     * @param key Bonus标识
     * @returns BonusInfo实例
     */
    public static createInfo(key: number): BonusInfo_SuperSevenBlasts {
        const info = new BonusInfo_SuperSevenBlasts();
        info.initData(key);
        return info;
    }
}

/**
 * SuperSevenBlasts游戏专属Bonus组件
 * 核心功能：Bonus游戏初始化、卡牌交互、动画控制、奖励计算、Bonus结束流程管理
 */
@ccclass()
export default class BonusComponent_SuperSevenBlasts extends cc.Component {
    // ========== 编辑器配置属性 ==========
    /** Bonus卡牌元素数组 */
    @property(BonusEleComponent_SuperSevenBlasts)
    public eles: BonusEleComponent_SuperSevenBlasts[] = [];

    /** Bonus主节点（控制整体动画） */
    @property({
        type: cc.Node,
        displayName: "Bonus主节点",
        tooltip: "挂载Bonus_open/stay/close动画的节点"
    })
    public bonusNode: cc.Node = null;

    /** 移动控制节点（管理Jackpot符号移动） */
    @property({
        type: MoveBonusGameComponent_SuperSevenBlasts,
        displayName: "移动控制组件",
        tooltip: "控制Bonus游戏中符号移动的组件"
    })
    public moveNode: MoveBonusGameComponent_SuperSevenBlasts = null;

    /** 遮罩节点（点击时屏蔽交互） */
    @property({
        type: cc.Node,
        displayName: "遮罩节点",
        tooltip: "Bonus游戏中屏蔽交互的遮罩"
    })
    public block_Node: cc.Node | null = null;

    /** 基础支付线节点数组 */
    @property({
        type: [cc.Node],
        displayName: "基础支付线节点",
        tooltip: "Bonus游戏中需要隐藏/显示的基础支付线"
    })
    public base_PayLines: cc.Node[] = [];

    /** 标题节点（控制奖励分数动画） */
    @property({
        type: cc.Node,
        displayName: "标题节点",
        tooltip: "挂载bonus_score相关动画的节点"
    })
    public title_Node: cc.Node | null = null;

    /** 透明度控制节点数组 */
    @property({
        type: [cc.Node],
        displayName: "透明度节点",
        tooltip: "Bonus打开时需要渐变显示的节点"
    })
    public opacity_Nodes: cc.Node[] = [];

    /** 卡牌容器节点 */
    @property({
        type: cc.Node,
        displayName: "卡牌容器节点",
        tooltip: "所有Bonus卡牌的父节点"
    })
    public cards_Node: cc.Node | null = null;

    // ========== 私有状态属性 ==========
    /** 当前奖励数值数组 */
    private _currentValues: number[] = [];
    /** Bonus信息数组 */
    private _bonusInfos: BonusInfo_SuperSevenBlasts[] = [];
    /** 当前Jackpot计数 */
    private _currentJackpotCount: number = 0;
    /** 未关闭的卡牌索引数组 */
    private _closeIndexes: number[] = [];
    /** 事件触发标记 */
    private _isEvent: boolean = false;
    /** 点击锁定标记 */
    private _isClicked: boolean = false;

    // ========== 生命周期与初始化 ==========
    protected onLoad(): void {
        // 确保关键节点/组件非空
        if (!this.bonusNode) console.error("[BonusComponent] bonusNode未配置！");
        if (!this.moveNode) console.error("[BonusComponent] moveNode未配置！");
        if (!this.block_Node) console.error("[BonusComponent] block_Node未配置！");
        if (!this.title_Node) console.error("[BonusComponent] title_Node未配置！");
    }

    /**
     * 初始化Bonus游戏状态
     */
    public init(): void {
        // 重置移动组件动画
        this.moveNode?.clearAllAnis();
        
        // 重置状态变量
        this._bonusInfos = [];
        this._closeIndexes = [];
        this._currentJackpotCount = 0;
        this._isEvent = false;
        this._isClicked = false;

        // 初始化卡牌元素
        this.eles.forEach(ele => {
            if (TSUtility.isValid(ele)) {
                ele.init(this.enterFunc.bind(this), this.leaveFunc.bind(this));
            }
        });

        // 初始化未关闭索引（0-23）
        for (let i = 0; i < 24; i++) {
            this._closeIndexes.push(i);
        }

        // 初始化Bonus信息（1-21）
        for (let i = 1; i < 22; i++) {
            this._bonusInfos.push(BonusInfo_SuperSevenBlasts.createInfo(i));
        }
        // 添加特殊Bonus信息（30/31/32）
        this._bonusInfos.push(BonusInfo_SuperSevenBlasts.createInfo(30));
        this._bonusInfos.push(BonusInfo_SuperSevenBlasts.createInfo(31));
        this._bonusInfos.push(BonusInfo_SuperSevenBlasts.createInfo(32));

        // 设置当前奖励数值
        this.setCurrentGauges();
    }

    // ========== Bonus信息管理 ==========
    /**
     * 根据key获取Bonus信息
     * @param key Bonus标识
     * @returns BonusInfo实例（无匹配返回null）
     */
    public getBonusInfo(key: number): BonusInfo_SuperSevenBlasts | null {
        return this._bonusInfos.find(info => info.key === key) || null;
    }

    /**
     * 设置当前奖励数值（从游戏结果中读取）
     */
    public setCurrentGauges(): void {
        // 初始化数值数组（24个0）
        this._currentValues = new Array(24).fill(0);

        // 从Bonus游戏状态中读取奖励数值
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        if (TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.gauges)) {
            for (let i = 0; i < 24; i++) {
                const gaugeKey = `sevenCount_${i + 1}`;
                if (TSUtility.isValid(bonusGameState.gauges[gaugeKey])) {
                    this._currentValues[i] = bonusGameState.gauges[gaugeKey];
                }
            }
        }
    }

    /**
     * 获取奖励数值差异列表（用于移动动画）
     * @returns 差异列表 [Vec2(索引, 数值)]
     */
    public getDiffList(): cc.Vec2[] {
        const diffList: cc.Vec2[] = [];
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");

        if (TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.gauges) && TSUtility.isValid(bonusGameState.exData)) {
            for (let i = 0; i < 24; i++) {
                const gaugeKey = `sevenCount_${i + 1}`;
                if (TSUtility.isValid(bonusGameState.gauges[gaugeKey]) && this._currentValues[i] !== bonusGameState.gauges[gaugeKey]) {
                    const exIndex = this.getExdataIndex(i + 1);
                    diffList.push(new cc.Vec2(exIndex, bonusGameState.gauges[gaugeKey]));
                }
            }
        }

        return diffList;
    }

    /**
     * 根据Bonus key获取exData中的索引
     * @param key Bonus标识
     * @returns 索引（无匹配返回-1）
     */
    public getExdataIndex(key: number): number {
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        for (let i = 0; i < 24; i++) {
            const exData = TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.exData) ? bonusGameState.exData[i] : null;
            if (TSUtility.isValid(exData) && key === parseInt(exData)) {
                return i;
            }
        }
        return -1;
    }

    // ========== 卡牌交互逻辑 ==========
    /**
     * 卡牌进入交互回调
     * @param index 卡牌索引（默认-1）
     */
    public enterFunc(index: number = -1): void {
        if (this._isEvent) return;

        // 取消所有调度器
        this.unscheduleAllCallbacks();

        // 停止非当前卡牌的动画
        this._closeIndexes.forEach(closeIndex => {
            if (closeIndex !== index && TSUtility.isValid(this.eles[closeIndex])) {
                this.eles[closeIndex].stopCard();
            }
        });
    }

    /**
     * 卡牌离开交互回调
     */
    public leaveFunc(): void {
        this.scheduleOnce(() => {
            this.shakeCard();
        }, 3);
    }

    /**
     * 屏蔽卡牌交互（显示遮罩）
     */
    public onBlock(): void {
        if (TSUtility.isValid(this.block_Node)) {
            this.block_Node.active = true;
        }

        // 停止所有未关闭卡牌的动画
        this._closeIndexes.forEach(index => {
            if (TSUtility.isValid(this.eles[index])) {
                this.eles[index].stopCard();
            }
        });
    }

    /**
     * 解除卡牌屏蔽（隐藏遮罩）
     */
    public offBlock(): void {
        if (TSUtility.isValid(this.block_Node)) {
            this.block_Node.active = false;
        }
        this._isEvent = false;

        this.scheduleOnce(() => {
            this.shakeCard();
        }, 3);
    }

    /**
     * 移除已打开的卡牌索引
     * @param index 卡牌索引
     */
    public spliceIndex(index: number): void {
        const idx = this._closeIndexes.findIndex(item => item === index);
        if (idx !== -1) {
            this._closeIndexes.splice(idx, 1);
        }
    }

    /**
     * 随机震动卡牌（增强交互反馈）
     */
    public shakeCard(): void {
        if (this._isEvent) return;

        // 取消所有调度器
        this.unscheduleAllCallbacks();

        const randomBool = Math.random() > 0.5;
        const shakeThree = this._closeIndexes.length > 6 && randomBool;
        const shakeTwo = this._closeIndexes.length > 6 && !randomBool;

        // 随机获取要震动的卡牌索引
        const getRandomIndex = (min: number, max: number): number => {
            return Math.floor(min+(max-min)*Math.random());
        };

        if (shakeThree) {
            // 震动3张卡牌（分三段随机）
            const part1 = Math.floor(this._closeIndexes.length / 3);
            const part2 = 2 * Math.floor(this._closeIndexes.length / 3);
            
            const idx1 = getRandomIndex(0, part1);
            const idx2 = getRandomIndex(part1 + 1, part2);
            const idx3 = getRandomIndex(part2 + 1, this._closeIndexes.length - 1);

            this.eles[this._closeIndexes[idx1]]?.shakeCard();
            this.eles[this._closeIndexes[idx2]]?.shakeCard();
            this.eles[this._closeIndexes[idx3]]?.shakeCard();
        } else if (shakeTwo) {
            // 震动2张卡牌（分两段随机）
            const part = Math.floor(this._closeIndexes.length / 2);
            
            const idx1 = getRandomIndex(0, part);
            const idx2 = getRandomIndex(part + 1, this._closeIndexes.length - 1);

            this.eles[this._closeIndexes[idx1]]?.shakeCard();
            this.eles[this._closeIndexes[idx2]]?.shakeCard();
        } else {
            // 震动1张卡牌
            const idx = getRandomIndex(0, this._closeIndexes.length);
            this.eles[this._closeIndexes[idx]]?.shakeCard();
        }

        // 3秒后重复震动
        this.scheduleOnce(() => {
            this.shakeCard();
        }, 3);
    }

    // ========== 动画控制 ==========
    /**
     * 播放Bonus打开动画
     */
    public openAni(): void {
        this.onBlock();

        // 重置透明度节点
        this.opacity_Nodes.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.opacity = 0;
            }
        });

        // 播放Bonus主节点打开动画
        const bonusAni = this.bonusNode?.getComponent(cc.Animation);
        bonusAni?.stop();
        bonusAni?.play("Bonus_open");
        bonusAni?.setCurrentTime(0);

        // 隐藏基础支付线
        this.base_PayLines.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.active = false;
            }
        });

        // 延迟播放标题出现动画
        this.scheduleOnce(() => {
            const titleAni = this.title_Node?.getComponent(cc.Animation);
            titleAni.stop();
            titleAni.play("bonus_score_appear");
            titleAni.setCurrentTime(0);
        }, 0.4);

        // 延迟播放标题停留动画并解除屏蔽
        this.scheduleOnce(() => {
            const titleAni = this.title_Node?.getComponent(cc.Animation);
            titleAni?.stop();
            titleAni?.play("bonus_score_stay");
            titleAni?.setCurrentTime(0);
            this.offBlock();
        }, 1.73);

        // 延迟开始卡牌震动
        this.scheduleOnce(() => {
            this.shakeCard();
        }, 5);
    }

    /**
     * 播放Bonus停留动画
     */
    public stayAni(): void {
        // 禁用多点触摸
        TSUtility.setMultiTouch(false);

        // 播放Bonus主节点停留动画
        const bonusAni = this.bonusNode?.getComponent(cc.Animation);
        bonusAni?.stop();
        bonusAni?.play("Bonus_stay");
        bonusAni?.setCurrentTime(0);

        // 播放标题停留动画
        const titleAni = this.title_Node?.getComponent(cc.Animation);
        titleAni?.stop();
        titleAni?.play("bonus_score_stay");
        titleAni?.setCurrentTime(0);
    }

    /**
     * 播放Bonus关闭动画
     */
    public closeAni(): void {
        // 播放Bonus主节点关闭动画
        const bonusAni = this.bonusNode?.getComponent(cc.Animation);
        bonusAni?.stop();
        bonusAni?.play("Bonus_close");
        bonusAni?.setCurrentTime(0);

        // 播放标题结束动画
        const titleAni = this.title_Node?.getComponent(cc.Animation);
        titleAni?.stop();
        titleAni?.play("bonus_score_end");
        titleAni?.setCurrentTime(0);
    }

    // ========== 卡牌点击处理 ==========
    /**
     * 卡牌点击回调
     * @param event 点击事件
     * @param indexStr 卡牌索引（字符串）
     */
    public onClick(event: Event, indexStr: string): void {
        if (this._isClicked) return;

        // 锁定点击状态
        this._isClicked = true;
        this.onBlock();
        this.unscheduleAllCallbacks();

        const index = parseInt(indexStr);
        this.spliceIndex(index);
        this._isEvent = true;

        // 提升当前卡牌层级
        const eleNode = this.eles[index]?.node;
        if (TSUtility.isValid(eleNode) && TSUtility.isValid(eleNode.parent)) {
            eleNode.setSiblingIndex(eleNode.parent.children.length - 1);
        }

        // 发送Bonus游戏请求
        SuperSevenBlastsManager.getInstance().sendBonusGameRequestSuperSevenBlasts(() => {
            const exData = SlotGameResultManager.Instance.getSubGameState("bonusGame").exData[index].toString();
            const bonusInfo = this.getBonusInfo(parseInt(exData));
            if (!bonusInfo) return;

            // 根据奖励类型处理
            if (bonusInfo.prizeUnit === "sevenCount") {
                // 普通奖励
                this.eles[index]?.showNormal(bonusInfo.prize);
                this._currentJackpotCount += bonusInfo.prize;
                SlotSoundController.Instance().playAudio("BonusNoraml", "FX");

                this.scheduleOnce(() => {
                    SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBonusCount(this._currentJackpotCount);
                    this.offBlock();
                    this._isClicked = false;
                }, 0.5);
            } else if (bonusInfo.prizeUnit === "superStar") {
                // 超级星星奖励
                this.eles[index]?.showBonus();
                SlotSoundController.Instance().playAudio("BonusGameAppear", "FX");

                const diffList = this.getDiffList();
                if (diffList.length > 0) {
                    this.scheduleOnce(() => {
                        this.moveSevenValue(index, diffList, () => {
                            this.scheduleOnce(() => {
                                this.offBlock();
                                this._isClicked = false;
                            }, 1);
                        });
                    }, 0.83);
                } else {
                    this.scheduleOnce(() => {
                        this.offBlock();
                        this._isClicked = false;
                    }, 0.5);
                }
            } else {
                // 结束奖励
                SlotManager.Instance.setFlagPlayingSubgame(true);
                this.eles[index]?.showEnd();
                SlotSoundController.Instance().playAudio("BonusEndSymbol", "FX");

                if (SlotGameResultManager.Instance.getNextSubGameKey() !== "bonusGame") {
                    this.scheduleOnce(() => {
                        this.endBonusState().onStart();
                    }, 1.5);
                } else {
                    SlotManager.Instance.setFlagPlayingSubgame(false);
                    const bonusIndex = this.getBonusIndex();
                    const clickIndex = index;

                    this.moveNode?.clearAllAnis();

                    // 延迟播放卡牌移动动画
                    this.scheduleOnce(() => {
                        this.eles[bonusIndex]?.exMoveBonus();
                    }, 1.33);

                    this.scheduleOnce(() => {
                        const fromRow = Math.floor(bonusIndex / 3);
                        const fromCol = Math.floor(bonusIndex % 3);
                        const toRow = Math.floor(clickIndex / 3);
                        const toCol = Math.floor(clickIndex % 3);

                        this.moveNode.moveJackpotSymbol(fromRow, fromCol, toRow, toCol);
                    }, 2.33);

                    this.scheduleOnce(() => {
                        let sevenCount = 0;
                        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
                        
                        if (TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.gauges)) {
                            const exData = bonusGameState.exData[clickIndex];
                            if (TSUtility.isValid(exData)) {
                                const gaugeKey = `sevenCount_${exData.toString()}`;
                                if (TSUtility.isValid(bonusGameState.gauges[gaugeKey])) {
                                    sevenCount = bonusGameState.gauges[gaugeKey];
                                }
                            }
                        }

                        // 更新卡牌状态和奖励计数
                        this.eles[bonusIndex]?.changeBonus();
                        this.eles[clickIndex]?.setNormal(sevenCount);
                        SlotSoundController.Instance().playAudio("BonusRevive", "FX");

                        if (sevenCount > 0) {
                            this._currentJackpotCount += sevenCount;
                            SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBonusCount(this._currentJackpotCount);
                        }

                        this.offBlock();
                        this._isClicked = false;
                    }, 3.16);
                }
            }

            // 更新当前奖励数值
            this.setCurrentGauges();
        }, [index]);
    }

    /**
     * 获取超级星星奖励的卡牌索引
     * @returns 卡牌索引（无匹配返回-1）
     */
    public getBonusIndex(): number {
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        for (let i = 0; i < 24; i++) {
            const exData = bonusGameState.exData[i];
            const bonusInfo = this.getBonusInfo(parseInt(exData));
            
            if (TSUtility.isValid(exData) && bonusInfo?.prizeUnit === "superStar" && this.eles[i]?._isEnable) {
                return i;
            }
        }
        return -1;
    }

    // ========== 奖励移动动画 ==========
    /**
     * 批量移动奖励数值
     * @param fromIndex 源卡牌索引
     * @param diffList 差异列表
     * @param callback 完成回调
     */
    public moveSevenValue(fromIndex: number, diffList: cc.Vec2[], callback?: () => void): void {
        let index = 0;
        const moveNext = () => {
            index++;
            if (index < diffList.length) {
                this.singleMove(fromIndex, diffList[index].x, diffList[index].y, moveNext);
            } else {
                this.scheduleOnce(() => {
                    this.setCurrentGauges();
                    this.moveNode?.clearAllAnis();
                    callback && callback();
                    if (diffList.length > 0) {
                        this.eles[fromIndex]?.exMoveBonus();
                    }
                }, 0.83);
            }
        };

        this.singleMove(fromIndex, diffList[index].x, diffList[index].y, moveNext);
    }

    /**
     * 单次移动奖励数值
     * @param fromIndex 源卡牌索引
     * @param toIndex 目标卡牌索引
     * @param value 奖励数值
     * @param callback 完成回调
     */
    public singleMove(fromIndex: number, toIndex: number, value: number, callback?: () => void): void {
        let delay = 0.83;

        // 根据奖励数值调整动画时长
        if (value >= 2) {
            this.eles[fromIndex]?.exMoveBonus();
            delay = 1;
        } else {
            this.eles[fromIndex]?.moveBonus();
        }

        // 播放移动动画
        this.scheduleOnce(() => {
            this.moveNode?.clearAllAnis();
            const fromRow = Math.floor(fromIndex / 3);
            const fromCol = Math.floor(fromIndex % 3);
            const toRow = Math.floor(toIndex / 3);
            const toCol = Math.floor(toIndex % 3);

            this.moveNode?.moveJackpotSymbol(fromRow, fromCol, toRow, toCol);
        }, delay);

        // 更新奖励数值并播放音效
        this.scheduleOnce(() => {
            SlotSoundController.Instance().playAudio("BonusChange", "FX");
            this.eles[toIndex]?.addNormal(value);
            this._currentJackpotCount += value;
            SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBonusCount(this._currentJackpotCount);
            callback && callback();
        }, delay + 0.83);
    }

    // ========== 继续游戏逻辑 ==========
    /**
     * 继续Bonus游戏（刷新卡牌状态）
     */
    public continueGame(): void {
        // 隐藏基础支付线
        this.base_PayLines.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.active = false;
            }
        });

        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        var endRevive = bonusGameState?.gauges?.endRevive || 0;

        if (TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.gauges)) {
            // 倒序遍历卡牌（23-0）
            for (let i = 23; i >= 0; i--) {
                const exData = TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.exData) ? bonusGameState.exData[i] : null;
                
                if (TSUtility.isValid(exData)) {
                    const bonusInfo = this.getBonusInfo(parseInt(exData));
                    if (!bonusInfo) continue;

                    const gaugeKey = `sevenCount_${exData.toString()}`;
                    const gaugeValue = TSUtility.isValid(bonusGameState.gauges[gaugeKey]) ? bonusGameState.gauges[gaugeKey] : 0;

                    // 移除已处理索引
                    this.spliceIndex(i);

                    // 根据奖励类型更新卡牌状态
                    if (bonusInfo.prizeUnit === "sevenCount") {
                        const totalPrize = bonusInfo.prize + gaugeValue;
                        this.eles[i]?.setNormal(totalPrize);
                        this._currentJackpotCount += totalPrize;
                    } else if (bonusInfo.prizeUnit === "superStar") {
                        if (endRevive === 0) {
                            this.eles[i]?.setNormal(0, false);
                        } else {
                            this.eles[i]?.setBonus();
                            endRevive--;
                        }
                    } else {
                        // 结束类型：计算累计奖励
                        let sevenCount = 0;
                        const exDataValue = TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.exData) ? bonusGameState.exData[i] : null;
                        
                        if (TSUtility.isValid(exDataValue)) {
                            const gaugeKey = `sevenCount_${exDataValue.toString()}`;
                            sevenCount = TSUtility.isValid(bonusGameState.gauges[gaugeKey]) ? bonusGameState.gauges[gaugeKey] : 0;
                        }

                        this._currentJackpotCount += sevenCount;
                        this.eles[i]?.setNormal(sevenCount);
                    }
                } else {
                    // 无数据时重置卡牌
                    this.eles[i]?.setCard();
                }
            }

            // 更新Jackpot计数显示
            if (this._currentJackpotCount > 0) {
                SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBonusCount(this._currentJackpotCount);
            }
        }

        // 延迟开始卡牌震动
        this.scheduleOnce(() => {
            this.shakeCard();
        }, 3);
    }

    // ========== Bonus游戏结束流程 ==========
    /**
     * 结束Bonus游戏状态（状态机管理）
     * @returns 顺序状态机实例
     */
    public endBonusState(): SequencialState {
        const seqState = new SequencialState();

        // 状态1：填充未打开的卡牌
        const fillState = new State();
        fillState.addOnStartCallback(() => {
            this.unscheduleAllCallbacks();

            const unopenedIndexes: number[] = [];
            let bonusKeys: number[] = [];
            const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");

            // 初始化Bonus key列表（1-21, 30-32）
            for (let i = 1; i < 22; i++) bonusKeys.push(i);
            bonusKeys.push(30, 31, 32);

            // 筛选未打开的卡牌索引
            for (let i = 0; i < 24; i++) {
                const exData = TSUtility.isValid(bonusGameState) && TSUtility.isValid(bonusGameState.exData) ? bonusGameState.exData[i] : null;
                
                if (TSUtility.isValid(exData)) {
                    // 移除已使用的Bonus key
                    for (let j = bonusKeys.length - 1; j >= 0; j--) {
                        if (parseInt(exData) === bonusKeys[j]) {
                            bonusKeys.splice(j, 1);
                        }
                    }
                } else {
                    unopenedIndexes.push(i);
                }
            }

            // 无未打开卡牌则完成状态
            if (unopenedIndexes.length <= 0) {
                fillState.setDone();
                return;
            }

            // 随机打乱Bonus key并填充未打开卡牌
            TSUtility.shuffle(bonusKeys);
            unopenedIndexes.forEach((index, idx) => {
                const bonusInfo = this.getBonusInfo(bonusKeys[idx]);
                if (!bonusInfo) return;

                if (bonusInfo.prizeUnit === "sevenCount") {
                    this.eles[index]?.showNormal(bonusInfo.prize, true);
                } else if (bonusInfo.prizeUnit === "superStar") {
                    this.eles[index]?.showBonus(true);
                } else {
                    this.eles[index]?.showEnd(true);
                }
            });

            // 播放音效并完成状态
            SlotSoundController.Instance().playAudio("BonusRevive", "FX");
            this.scheduleOnce(() => {
                fillState.setDone();
            }, 1.5);
        });

        // 状态2：结算奖励并播放动画
        const settleState = new State();
        settleState.addOnStartCallback(() => {
            const totalJackpot = this._currentJackpotCount;
            const winningCoin = SlotGameResultManager.Instance.getWinningCoin();

            // 启用多点触摸
            TSUtility.setMultiTouch(true);

            if (winningCoin > 0) {
                // 显示Bonus特效
                SuperSevenBlastsManager.getInstance().game_components.reelBGComponent.showBonusFx();
                
                // 重置底部文本并播放奖励动画
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                
                SlotManager.Instance.bottomUIText.playChangeWinMoney(0, winningCoin, null, false, 1);

                this.scheduleOnce(() => {
                    // 停止奖励音效
                    SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");

                    const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
                    if (jackpotResults.length > 0) {
                        const jackpotComp = SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay;
                        jackpotComp.setPlayingState(jackpotResults[0].jackpotSubKey, false);
                        jackpotComp.setShowingMoney(jackpotResults[0].jackpotSubKey, winningCoin);
                    }

                    // 打开Jackpot结果弹窗
                    SuperSevenBlastsManager.getInstance().game_components.openJackpotResultPopup(winningCoin, totalJackpot, () => {
                        const winType = SlotGameResultManager.Instance.getWinType(winningCoin);
                        if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                            // 播放大额奖励特效
                            const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                            
                            if (bigWinEffect) {
                                bigWinEffect._isPlayExplodeCoin = false;
                                bigWinEffect.playWinEffectWithoutIncreaseMoney(winningCoin, totalBet, () => {
                                    // 预约新记录弹窗
                                    ServicePopupManager.instance().reserveNewRecordPopup(winningCoin);
                                    SlotSoundController.Instance().playAudio("BonusEnd", "FX");
                                    
                                    const jackpotComp = SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay;
                                    jackpotComp.setPlayingState(jackpotResults[0].jackpotSubKey, true);
                                    
                                    // 播放关闭动画
                                    this.closeAni();
                                    this.scheduleOnce(() => {
                                        settleState.setDone();
                                    }, 0.92);
                                });
                            }
                        } else {
                            // 普通奖励流程
                            ServicePopupManager.instance().reserveNewRecordPopup(winningCoin);
                            SlotSoundController.Instance().playAudio("BonusEnd", "FX");
                            
                            this.closeAni();
                            this.scheduleOnce(() => {
                                const jackpotComp = SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay;
                                jackpotComp.setPlayingState(jackpotResults[0].jackpotSubKey, false);
                                settleState.setDone();
                            }, 0.92);
                        }
                    });
                }, 1.1);
            } else {
                // 无奖励流程
                SlotSoundController.Instance().playAudio("BonusEnd", "FX");
                this.closeAni();
                
                this.scheduleOnce(() => {
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "GOOD LUCK!");
                    settleState.setDone();
                }, 0.92);
            }
        });

        // 状态3：重置游戏状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            // 重置游戏状态
            SlotManager.Instance.setFlagPlayingSubgame(false);
            SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.hideCount();
            SuperSevenBlastsManager.getInstance().game_components.topSevenComponent.setStay();
            
            // 启用下注按钮
            const bottomUI = SlotManager.Instance._bottomUI;
            bottomUI.setChangeBetPerLineBtnInteractable(true);
            bottomUI.setChangeMaxBetBtnInteractable(true);
            
            // 重置滚轮状态
            SlotReelSpinStateManager.Instance.setSpinMode(true);
            bottomUI.setButtonActiveState(null);
            SlotManager.Instance.setKeyboardEventFlag(true);
            
            // 解除屏蔽并隐藏Bonus节点
            this.offBlock();
            this.node.active = false;
            
            // 显示基础支付线
            this.base_PayLines.forEach(node => {
                if (TSUtility.isValid(node)) {
                    node.active = true;
                }
            });

            // 播放主背景音乐
            SlotManager.Instance.playMainBgm();
            
            // 重置滚轮旋转状态
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_STOP);
            SlotReelSpinStateManager.Instance.sendChangeStateEventToObservers();
            
            // 自动旋转模式下继续旋转
            if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
                SlotManager.Instance.spinAll();
            }

            resetState.setDone();
        });

        // 组装状态机
        seqState.insert(1, fillState);
        seqState.insert(2, settleState);
        seqState.insert(3, SlotManager.Instance.getTourneyResultProcess());
        seqState.insert(4, resetState);

        return seqState;
    }
}