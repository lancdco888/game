
// 奖金组件依赖
import SlotSoundController from '../../Slot/SlotSoundController';
import TSUtility from '../../global_utility/TSUtility';
import SlotManager from '../../manager/SlotManager';
import PrizeComponent_HoundOfHades from './PrizeComponent_HoundOfHades';

const { ccclass, property } = cc._decorator;

/**
 * 奖金项类型枚举（匹配业务逻辑中的类型）
 */
export enum PrizeType {
    MULTIPLIER = "multiplier",
    JACKPOT = "jackpot"
}

/**
 * 奖金项实体类（对应原代码中的d函数）
 */
export class PrizeItem {
    /** 奖金类型（multiplier/jackpot） */
    public type: PrizeType;
    /** 奖金金额 */
    public prize: number;
    /** Jackpot标识Key（仅jackpot类型有效） */
    public keyJackpot: string;

    constructor(type: PrizeType, prize: number, keyJackpot: string = "") {
        this.type = type;
        this.prize = prize;
        this.keyJackpot = keyJackpot;
    }

    // 类型常量（与原代码保持一致）
    public static readonly TYPE_MULTIPLIER: PrizeType = PrizeType.MULTIPLIER;
    public static readonly TYPE_JACKPOT: PrizeType = PrizeType.JACKPOT;
}

/**
 * 哈迪斯之犬 - 蓝色奖金符号组件（注：原类名拼写错误Bluee→Blue）
 * 核心职责：
 * 1. 生成奖金列表（包含倍数奖池、Jackpot奖池）并排序
 * 2. 计算蓝色符号动画播放次数
 * 3. 分步执行蓝色符号动画、音效播放、奖金UI更新
 */
@ccclass()
export default class BonusBlueeComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 符号骨骼动画组件 */
    @property(sp.Skeleton)
    public symbol_Ani: sp.Skeleton = null;

    /** 信息面板动画组件（B1_feature1动画） */
    @property(cc.Animation)
    public info_Animation: cc.Animation = null;

    // ====== 私有常量（奖金数值配置，原代码硬编码值） ======
    /** 原始奖金数值列表（未使用，保留兼容） */
    private readonly _prizeValues: number[] = [0, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 10000, 20000];
    /** 实际使用的奖金数值列表（倍数类型） */
    private readonly _prizeValues_Changed: number[] = [0, 500, 750, 1250, 1500, 1750, 2500, 3000, 4000, 5000];

    // ====== 私有常量（动画名称，原代码硬编码值，注：featrue为feature拼写错误，保留兼容） ======
    /** feature1动画名称（初始化蓝色符号） */
    private readonly _featureName: string = "3_feature1";
    /** 失败动画名称（普通） */
    private readonly _featrueFail: string = "5_feature_fail";
    /** 失败动画名称（Mega） */
    private readonly _featrueFail_Mega: string = "5_feature_fail_Mega";
    /** idle动画名称（持续显示状态） */
    private readonly _idleName: string = "2_stay";

    // ====== 私有状态变量 ======
    /** 当前奖金值索引（用于分步播放动画） */
    private _valueIndex: number = 0;
    /** 缓存的奖金列表（避免重复生成） */
    private _prizeList: PrizeItem[] = null;

    // ====== 核心方法 ======
    /**
     * 初始化方法（原代码空实现，保留扩展）
     */
    init(): void {}

    /**
     * 生成并缓存奖金列表（倍数奖池 + Jackpot奖池）
     * @returns 排序后的奖金列表
     */
    getPrizeList(): PrizeItem[] {
        // 已缓存则直接返回
        if (this._prizeList) {
            return this._prizeList;
        }

        const prizeList: PrizeItem[] = [];

        // 1. 添加倍数类型奖金项
        for (let i = 0; i < this._prizeValues_Changed.length; ++i) {
            prizeList.push(new PrizeItem(PrizeItem.TYPE_MULTIPLIER, this._prizeValues_Changed[i], ""));
        }

        // 2. 添加Jackpot类型奖金项（从SlotManager获取Jackpot信息）
        const slotJackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
        if (slotJackpotInfo) {
            for (let i = 0; i < 4; i++) { // 原代码固定取4个Jackpot项（索引0-3）
                const jackpotMoneyInfo = slotJackpotInfo.getJackpotMoneyInfo(i);
                if (jackpotMoneyInfo) {
                    prizeList.push(new PrizeItem(
                        PrizeItem.TYPE_JACKPOT,
                        jackpotMoneyInfo.basePrize,
                        jackpotMoneyInfo.jackpotKey
                    ));
                }
            }
        } else {
            console.warn("BonusBlueComponent: 获取SlotJackpotInfo失败！");
        }

        // 3. 排序规则：
        // - 优先按奖金金额升序
        // - 金额相同时，同类型保持顺序，不同类型则倍数类型排在Jackpot前
        prizeList.sort((a, b) => {
            if (a.prize !== b.prize) {
                return a.prize - b.prize;
            }
            // 金额相同时的排序逻辑
            if ((a.type === PrizeItem.TYPE_MULTIPLIER && b.type === PrizeItem.TYPE_MULTIPLIER) ||
                (a.type === PrizeItem.TYPE_JACKPOT && b.type === PrizeItem.TYPE_JACKPOT)) {
                return 0;
            }
            return a.type === PrizeItem.TYPE_MULTIPLIER ? -1 : 1;
        });

        // 缓存奖金列表
        this._prizeList = prizeList;
        return prizeList;
    }

    /**
     * 初始化蓝色符号并开始分步播放动画
     * @param targetPrize 目标奖金项（最终要显示的奖金）
     * @param callback 动画完成后的回调
     */
    setBlue(targetPrize: any, callback?: () => void): void {
        // 安全校验：目标奖金项无效时直接执行回调
        if (!targetPrize || !targetPrize.type || isNaN(targetPrize.prize)) {
            console.warn("BonusBlueComponent: targetPrize必须为有效PrizeItem对象！");
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 重置当前索引
        this._valueIndex = 0;

        // 计算需要播放的动画次数
        const playCount = this.getPlayCount(targetPrize);

        // 播放次数≤0时直接执行回调
        if (playCount <= 0) {
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 递归执行单步动画
        const playStep = () => {
            if (this._valueIndex < playCount) {
                this.singlePlay(playCount, playStep);
            } else {
                TSUtility.isValid(callback) && callback!();
            }
        };

        // 启动第一步动画
        this.singlePlay(playCount, playStep);
    }

    /**
     * 执行单步动画（核心动画逻辑）
     * @param totalCount 总播放次数
     * @param nextStep 下一步动画的回调
     */
    singlePlay(totalCount: number, nextStep: () => void): void {
        const self = this;
        const prizeList = this.getPrizeList();

        // 安全校验：组件未配置/奖金列表为空时直接执行下一步
        if (!this.symbol_Ani || !this.info_Animation || !prizeList || prizeList.length === 0) {
            console.warn("BonusBlueComponent: symbol_Ani/info_Animation未配置或奖金列表为空！");
            this._valueIndex++;
            nextStep();
            return;
        }

        // 步骤1：播放feature1动画，更新奖金UI，播放音效，索引+1
        const step1 = cc.callFunc(() => {
            // 播放骨骼feature1动画（非循环）
            self.symbol_Ani!.setAnimation(0, self._featureName, false);
            
            // 更新奖金组件显示
            const currentPrizeItem = prizeList[self._valueIndex];
            const prizeComponent = self.getComponent(PrizeComponent_HoundOfHades);
            if (prizeComponent && currentPrizeItem) {
                prizeComponent.setPrize(currentPrizeItem.prize, currentPrizeItem.keyJackpot);
            }

            // 播放Bonus1音效
            SlotSoundController.Instance().playAudio("Bonus1", "FX");
            
            // 索引自增
            self._valueIndex++;
        });

        // 步骤2：延迟1秒后更新奖金UI（显示下一个奖金值）
        const step2 = cc.callFunc(() => {
            const nextPrizeItem = prizeList[self._valueIndex];
            const prizeComponent = self.getComponent(PrizeComponent_HoundOfHades);
            if (prizeComponent && nextPrizeItem) {
                prizeComponent.setPrize(nextPrizeItem.prize, nextPrizeItem.keyJackpot);
            }
        });

        // 步骤3：最后一步时播放失败动画+对应音效，否则直接执行下一步
        let step3: any;
        if (this._valueIndex === totalCount - 1) {
            step3 = cc.callFunc(() => {
                // 判断是否播放Mega失败动画（最后一个奖金项）
                const isMega = prizeList[self._valueIndex] === prizeList[prizeList.length - 1];
                const failAniName = isMega ? self._featrueFail_Mega : self._featrueFail;
                
                // 播放失败骨骼动画（非循环）
                self.symbol_Ani!.setAnimation(0, failAniName, false);
                
                // 播放对应音效
                if (isMega) {
                    SlotSoundController.Instance().playAudio("BlueMega", "FX");
                } else {
                    SlotSoundController.Instance().playAudio("Bonus1_Last", "FX");
                }
            });
        } else {
            step3 = cc.callFunc(() => {
                TSUtility.isValid(nextStep) && nextStep();
            });
        }

        // 步骤4：播放idle循环动画，并执行下一步（仅最后一步需要）
        const step4 = cc.callFunc(() => {
            // 播放idle骨骼动画（循环）
            self.symbol_Ani!.setAnimation(0, self._idleName, true);
            
            // 最后一步时执行下一步回调
            if (this._valueIndex === totalCount - 1) {
                TSUtility.isValid(nextStep) && nextStep();
            }
        });

        // 组装动画序列并执行
        if (this._valueIndex === totalCount - 1) {
            // 最后一步：step1 → 延迟1秒 → step2 → 延迟1秒 → step3 → 延迟1.5秒 → step4
            this.node.runAction(cc.sequence(
                step1,
                cc.delayTime(1),
                step2,
                cc.delayTime(1),
                step3,
                cc.delayTime(1.5),
                step4
            ));
        } else {
            // 非最后一步：step1 → 延迟1秒 → step2 → 延迟1秒 → step3
            this.node.runAction(cc.sequence(
                step1,
                cc.delayTime(1),
                step2,
                cc.delayTime(1),
                step3
            ));
        }
    }

    /**
     * 计算动画播放次数（根据目标奖金项在列表中的索引）
     * @param targetPrize 目标奖金项
     * @returns 播放次数（即目标奖金项在列表中的索引）
     */
    getPlayCount(targetPrize: PrizeItem): number {
        if (!targetPrize || !targetPrize.type || isNaN(targetPrize.prize)) {
            return 0;
        }

        const prizeList = this.getPrizeList();
        let playCount = 0;

        // 遍历奖金列表，匹配目标奖金项
        for (let i = 0; i < prizeList.length; i++) {
            const item = prizeList[i];
            // 匹配Jackpot类型
            if (targetPrize.type === PrizeItem.TYPE_JACKPOT && 
                item.type === PrizeItem.TYPE_JACKPOT && 
                targetPrize.keyJackpot === item.keyJackpot) {
                playCount = i;
                break;
            }
            // 匹配倍数类型
            if (targetPrize.type === PrizeItem.TYPE_MULTIPLIER && 
                item.type === PrizeItem.TYPE_MULTIPLIER && 
                targetPrize.prize === item.prize) {
                playCount = i;
                break;
            }
        }

        return playCount;
    }
}
