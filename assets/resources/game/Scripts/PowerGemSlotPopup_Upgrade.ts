const { ccclass, property } = cc._decorator;

import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import TimeFormatHelper from "../../../Script/global_utility/TimeFormatHelper";
import PowerGemManager from "../../../Script/manager/PowerGemManager";
import CustomRichText from "../../../Script/slot_common/CustomRichText";
import { PowerGemSlotOpenType } from "./PowerGemSlotPopup";
import { PowerGemSlotUpgrade } from "./PowerGemSlotUpgrade";




/**
 * PowerGem插槽升级弹窗主组件
 */
@ccclass()
export default class PowerGemSlotPopup_Upgrade extends cc.Component {
    // ================= 动画名称常量 =================
    private readonly ANIMATION_NAME_OPEN: string = "Upgrade_Glow_Ani"; // 解锁动画
    private readonly ANIMATION_NAME_LOCK: string = "Upgrade_Glow_Lock_Ani"; // 锁定动画
    private readonly ANIMATION_NAME_LOOP: string = "Upgrade_Glow_Loop_Ani"; // 循环动画
    private readonly ANIMATION_NAME_NORMAL: string = "Upgrade_Normal_Loop_Ani"; // 普通循环动画
    private readonly ANIMATION_NAME_UPGRADE: string = "Upgrade_Ani"; // 升级动画

    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Label)
    public lblUpToCoin: cc.Label = null; // 最高金币奖励标签

    @property(cc.Label)
    public lblTime: cc.Label = null; // 剩余时间标签

    @property(cc.Label)
    public lblLock: cc.Label = null; // 锁定标签

    @property(cc.Label)
    public lblJokerPoint: cc.Label = null; // Joker点数标签

    @property(cc.Animation)
    public animAddCoin: cc.Animation = null; // 金币增加动画

    @property(cc.Animation)
    public animAddCardPack: cc.Animation = null; // 卡牌包增加动画

    @property(cc.Node)
    public nodeAddCoin: cc.Node = null; // 金币增加节点

    @property(cc.Node)
    public nodeAddCardPack: cc.Node = null; // 卡牌包增加节点

    @property(cc.Node)
    public nodeTime: cc.Node = null; // 时间节点

    @property(cc.Node)
    public nodeCollectButton: cc.Node = null; // 收集按钮节点

    @property(cc.Node)
    public nodeDimCollect: cc.Node = null; // 收集按钮遮罩节点

    @property({ type: [PowerGemSlotUpgrade], displayName: "升级项列表" })
    public arrUpgrade: PowerGemSlotUpgrade[] = []; // 升级项列表

    // ================= 私有状态变量 =================
    private _numSlotIndex: number = 0; // 插槽索引
    private _infoPowerGem: { // PowerGem信息类型（适配PowerGemManager返回值）
        getPowerGemDuplicateLevel: () => number;
        getPowerGemGradeType: () => number;
        getPowerGemLevel: () => number;
        getPowerGemClearDate: () => number;
    } = null;
    private _setUI: ((type: PowerGemSlotOpenType, index: number, isForce?: boolean) => void) = null; // UI更新回调
    private _close: (() => void) = null; // 弹窗关闭回调
    private _remainTimeFormat: TimeFormatHelper = null; // 剩余时间格式化实例
    private _numRemainMaxTime: number = 0; // 最大剩余时间（秒）
    private _numRemainTime: number = 0; // 当前剩余时间（秒）
    private _numExpireDate: number = 0; // 过期时间戳（秒）
    private _isUpgradeAction: boolean = false; // 是否正在执行升级动作


    // ================= 核心方法 =================
    /**
     * 初始化弹窗回调
     * @param setUICallback UI更新回调
     * @param closeCallback 关闭回调
     */
    public initialize(
        setUICallback: (type: PowerGemSlotOpenType, index: number, isForce?: boolean) => void,
        closeCallback: () => void
    ): void {
        this._setUI = setUICallback;
        this._close = closeCallback;
    }

    /**
     * 设置弹窗数据
     * @param slotIndex 插槽索引
     */
    public setData(slotIndex: number): void {
        this._numSlotIndex = slotIndex;
        this._infoPowerGem = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);

        // 无效PowerGem信息：关闭弹窗
        if (!TSUtility.isValid(this._infoPowerGem)) {
            this._close?.();
            return;
        }

        // 重置状态
        this.unscheduleAllCallbacks();
        this.nodeCollectButton!.active = false;
        this.nodeDimCollect!.active = false;

        // 判断是否正在升级动作中
        const actionInfo = PowerGemManager.instance.getActionPowerGemInfo();
        this._isUpgradeAction = TSUtility.isValid(actionInfo) && !PowerGemManager.instance.getFinishUpgrade();

        // 播放升级动画
        this.playUpgradeAction().catch((err) => {
            cc.error(`PowerGemSlotPopup_Upgrade: 播放升级动画失败 - ${err}`);
            this._close?.();
        });
    }

    /**
     * 播放升级动画（异步）
     */
    public async playUpgradeAction(): Promise<void> {
        if (!this._infoPowerGem || !this.lblUpToCoin || !this.lblJokerPoint) return;

        try {
            // 1. 获取基础数据
            const currentLevel = this._infoPowerGem.getPowerGemDuplicateLevel() + 1;
            const rewardCoin = PowerGemManager.instance.getPowerGemRewardCoin(
                this._infoPowerGem.getPowerGemGradeType(),
                this._infoPowerGem.getPowerGemLevel()
            );

            // 2. 更新金币奖励显示
            this.lblUpToCoin.string = `UP TO ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(rewardCoin)}`;

            // 3. 更新Joker点数显示
            const jokerPointRange = PowerGemManager.instance.getJokerPointDate(this._infoPowerGem.getPowerGemGradeType());
            this.lblJokerPoint.string = `${jokerPointRange[0].toString()}~${jokerPointRange[1].toString()} PT`;

            // 4. 查找对应等级的升级项
            const upgradeItem = this.arrUpgrade.find(item => item.grade === this._infoPowerGem.getPowerGemGradeType());
            if (!upgradeItem) {
                this._close?.();
                return;
            }

            // 5. 更新等级文本
            if (upgradeItem.lblLevel) {
                upgradeItem.lblLevel.string = `WIN A POWER GEM AT <color=#FFFFFF> ${this._infoPowerGem.getPowerGemLevel().toString()} OR HIGER</color>`;
            }

            // 6. 播放等级动画（锁定/普通）
            upgradeItem.arrAni.forEach((ani, index) => {
                if (TSUtility.isValid(ani)) {
                    const isLock = currentLevel - 1 <= index;
                    ani.play(isLock ? this.ANIMATION_NAME_LOCK : this.ANIMATION_NAME_NORMAL, 0);
                }
            });

            // 7. 控制箭头节点显隐
            upgradeItem.arrArrow.forEach((arrowNode, index) => {
                arrowNode.active = currentLevel - 1 > 1 + index;
            });

            // 8. 控制奖励节点透明度
            this.nodeAddCardPack!.opacity = currentLevel - 1 >= 1 ? 255 : 0;
            this.nodeAddCoin!.opacity = currentLevel - 1 >= 2 ? 255 : 0;

            // 9. 初始化剩余时间
            this._numExpireDate = this._infoPowerGem.getPowerGemClearDate();
            this._numRemainTime = this._numExpireDate - TSUtility.getServerBaseNowUnixTime();
            this._remainTimeFormat = new TimeFormatHelper(this._numRemainTime);

            // 10. 处理剩余时间显示
            if (this._remainTimeFormat.getTime() > 0) {
                this.nodeTime!.active = true;
                this.lblTime!.node.active = true;
                this.lblLock!.node.active = false;

                // 获取最大开放时间并启动定时更新
                const openTime = PowerGemManager.instance.getPowerGemOpenTime(this._infoPowerGem.getPowerGemGradeType());
                this._numRemainMaxTime = 60 * openTime; // 转换为秒
                this.updateRemainTime();
                this.schedule(this.updateRemainTime, 1); // 每1秒更新
            } else {
                this.nodeTime!.active = false;
            }

            // 11. 非升级动作：直接结束
            if (!this._isUpgradeAction) return;

            // 12. 升级动作：延迟播放解锁动画
            await AsyncHelper.delayWithComponent(1, this);

            // 13. 更新箭头显隐（升级后）
            upgradeItem.arrArrow.forEach((arrowNode, index) => {
                arrowNode.active = currentLevel > 1 + index;
            });

            // 14. 播放解锁动画
            const targetAni = upgradeItem.arrAni[currentLevel - 1];
            if (TSUtility.isValid(targetAni)) {
                targetAni.play(this.ANIMATION_NAME_OPEN, 0);
            }

            // 15. 延迟播放奖励动画
            await AsyncHelper.delayWithComponent(0.5, this);

            // 16. 播放金币/卡牌包升级动画
            if (this.nodeAddCardPack!.opacity === 0 && currentLevel >= 1 && this.animAddCardPack) {
                this.animAddCardPack.play(this.ANIMATION_NAME_UPGRADE, 0);
            }
            if (this.nodeAddCoin!.opacity === 0 && currentLevel >= 2 && this.animAddCoin) {
                this.animAddCoin.play(this.ANIMATION_NAME_UPGRADE, 0);
            }

            // 17. 播放循环动画
            if (TSUtility.isValid(targetAni)) {
                targetAni.play(this.ANIMATION_NAME_LOOP, 0);
            }

            // 18. 标记升级完成
            PowerGemManager.instance.setFinishUpgrade(true);

            // 19. 升级到3级：更新UI；否则关闭弹窗
            if (currentLevel >= 3) {
                this.scheduleOnce(() => {
                    this._setUI?.(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex, true);
                }, 2.5);
            } else {
                this.scheduleOnce(() => {
                    this._close?.();
                }, 5);
            }
        } catch (err) {
            cc.error(`PowerGemSlotPopup_Upgrade: 升级动画逻辑异常 - ${err}`);
            this._close?.();
        }
    }

    /**
     * 更新剩余时间
     */
    public updateRemainTime(): void {
        if (!this._remainTimeFormat || !this.lblTime) return;

        // 计算时间差值
        const timeDiff = this._numRemainTime - this.getServerRemainTime();
        // 更新时间格式化实例
        this._remainTimeFormat.addSecond(-timeDiff);
        this._numRemainTime -= timeDiff;

        // 限制最大剩余时间
        if (this._numRemainTime > this._numRemainMaxTime) {
            this._numRemainTime = this._numRemainMaxTime;
        }

        // 更新时间UI
        this.setRemainTimeUI();

        // 时间过期：停止更新
        if (this._remainTimeFormat.getTime() <= 0) {
            this.unscheduleAllCallbacks();
            if (!this._isUpgradeAction) {
                this._setUI?.(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex, true);
            } else {
                this.nodeTime!.active = false;
            }
        }
    }

    /**
     * 获取服务器剩余时间
     * @returns 剩余秒数
     */
    public getServerRemainTime(): number {
        const currentServerTime = TSUtility.getServerBaseNowUnixTime();
        return this._numExpireDate - currentServerTime;
    }

    /**
     * 设置剩余时间UI显示
     */
    public setRemainTimeUI(): void {
        if (!this.lblTime || !this.nodeTime) return;

        if (this._remainTimeFormat!.getTime() >= 0) {
            // 格式化剩余时间并显示
            this.lblTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(this._numRemainTime);
        } else {
            // 时间过期：非升级动作更新UI；否则隐藏时间节点
            if (!this._isUpgradeAction) {
                this._setUI?.(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex, true);
            } else {
                this.nodeTime.active = false;
            }
        }
    }
}