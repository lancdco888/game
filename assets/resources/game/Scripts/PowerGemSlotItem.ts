import GameCommonSound from "../../../Script/GameCommonSound";
import TSUtility from "../../../Script/global_utility/TSUtility";
import TimeFormatHelper from "../../../Script/global_utility/TimeFormatHelper";
import { Utility } from "../../../Script/global_utility/Utility";
import PowerGemManager from "../../../Script/manager/PowerGemManager";
import PowerGemSlotPopup, { PowerGemSlotOpenType } from "./PowerGemSlotPopup";

const { ccclass, property } = cc._decorator;



/**
 * PowerGem老虎机Slot项组件 (等级/时间/状态管理+动画控制)
 * PowerGemSlotItem
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemSlotItem extends cc.Component {
    // ===================== 动画常量 【与原JS完全一致】 =====================
    private readonly ANIMATION_NAME_SELECT: string = "Btn_Slot_Ani";
    private readonly ANIMATION_NAME_STOP: string = "Btn_Slot_Stop_Ani";
    private readonly ANIMATION_NAME_GLOW: string = "Gem_TapGlow_Ani";
    private readonly ANIMATION_NAME_TAP: string = "Tap_Ani";

    // ===================== Cocos 序列化属性 【与原JS 1:1精准对应】 =====================
    @property({ type: [cc.Node], displayName: "等级图标数组" })
    public arrGrade: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: "等级等级图标数组" })
    public arrLevelGrade: cc.Node[] = [];

    @property({ type: cc.Node, displayName: "空状态节点" })
    public nodeEmpty: cc.Node = null;

    @property({ type: cc.Node, displayName: "等级节点" })
    public nodeLevel: cc.Node = null;

    @property({ type: cc.Node, displayName: "时间节点" })
    public nodeTime: cc.Node = null;

    @property({ type: cc.Node, displayName: "锁定节点" })
    public nodeLock: cc.Node = null;

    @property({ type: cc.Node, displayName: "选中节点" })
    public nodeSelect: cc.Node = null;

    @property({ type: cc.Node, displayName: "时间框节点" })
    public nodeTimeFrame: cc.Node = null;

    @property({ type: cc.Node, displayName: "升级节点" })
    public nodeUpgrade: cc.Node = null;

    @property({ type: cc.Node, displayName: "打开节点" })
    public nodeOpen: cc.Node = null;

    @property({ type: cc.Label, displayName: "等级文本" })
    public lblLevel: cc.Label = null;

    @property({ type: cc.Label, displayName: "时间文本" })
    public lblTime: cc.Label = null;

    @property({ type: cc.Label, displayName: "升级时间文本" })
    public lblUpgradeTime: cc.Label = null;

    @property({ type: cc.Label, displayName: "锁定文本" })
    public lblLock: cc.Label = null;

    @property({ type: cc.Animation, displayName: "Slot动画组件" })
    public animSlot: cc.Animation = null;

    @property({ type: cc.Animation, displayName: "点击动画组件" })
    public animTap: cc.Animation = null;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _numSlotIndex: number = 0;
    private _onClickSlot: Function = null;
    private _remainTimeFormat: TimeFormatHelper = null;
    private _numRemainMaxTime: number = 0;
    private _numRemainTime: number = 0;
    private _numExpireDate: number = 0;
    private _arrAnimGlow: cc.Animation[] = [];
    private _info: any = null; // PowerGemInfo实例（根据项目实际类型替换）

    // ===================== 核心方法 【1:1还原原JS逻辑】 =====================
    /**
     * 初始化Slot项
     * @param onClickSlot 点击回调函数
     * @param slotIndex Slot项索引
     */
    initialize(onClickSlot: Function, slotIndex: number): void {
        this._onClickSlot = onClickSlot;
        this._numSlotIndex = slotIndex;

        // 给按钮添加点击事件（原JS逻辑保留）
        const button = this.node.getComponent(cc.Button);
        button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotItem", "onClick_Slot", ""));

        // 初始化状态并隐藏选中节点
        this.updateSlotItem();
        this.nodeSelect.active = false;
    }

    /**
     * 更新Slot项状态（核心逻辑）
     */
    updateSlotItem(): void {
        // 清除所有调度器
        this.unscheduleAllCallbacks();
        // 获取当前Slot项的PowerGem信息
        this._info = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);

        // 重置所有节点显隐状态
        this.nodeEmpty.active = false;
        this.nodeLevel.active = false;
        this.nodeTime.active = false;
        this.nodeUpgrade.active = false;
        this.nodeTimeFrame.active = false;
        this.nodeLock.active = false;
        this.nodeOpen.active = false;

        // 重置等级图标和动画
        this.arrGrade.forEach((gradeNode: cc.Node) => {
            gradeNode.active = false;
            const pivotNode = gradeNode.getChildByName("Pivot");
            if (TSUtility.isValid(pivotNode)) {
                const anim = pivotNode.getComponent(cc.Animation);
                if (TSUtility.isValid(anim)) {
                    anim.stop();
                    this._arrAnimGlow.push(anim);
                }
            }
        });

        // 信息有效时处理状态
        if (TSUtility.isValid(this._info)) {
            // 非空状态
            if (!this._info.isEmpty()) {
                this.nodeLevel.active = true;

                // 显示对应等级图标
                this.arrGrade.forEach((gradeNode: cc.Node, index: number) => {
                    gradeNode.active = index === this._info.getPowerGemGradeType();
                });

                // 更新等级文本和等级等级图标
                this.lblLevel.string = this._info.getPowerGemLevel().toString();
                this.arrLevelGrade.forEach((levelGradeNode: cc.Node, index: number) => {
                    levelGradeNode.active = index === this._info.getPowerGemLevelGradeType() - 1;
                });

                // 获取AD Slot索引
                const adSlotIndex = PowerGemManager.instance.getADSlotIndex(this._numSlotIndex);

                // 开启中且非AD Slot
                if (this._info.isOpening() && !adSlotIndex) {
                    // 根据是否允许升级控制节点显隐
                    this.nodeTime.active = !PowerGemManager.instance.isUpgradeAllows();
                    this.nodeUpgrade.active = PowerGemManager.instance.isUpgradeAllows();
                    this.nodeTimeFrame.active = true;

                    // 计算过期时间和剩余时间
                    this._numExpireDate = this._info.getPowerGemClearDate();
                    this._numRemainTime = this._numExpireDate - TSUtility.getServerBaseNowUnixTime();
                    this._remainTimeFormat = new TimeFormatHelper(this._numRemainTime);

                    // 获取最大剩余时间并启动倒计时
                    const openTime = PowerGemManager.instance.getPowerGemOpenTime(this._info.getPowerGemGradeType());
                    this._numRemainMaxTime = 60 * openTime;
                    this.setRemainTimeUI();
                    this.schedule(this.updateRemainTime, 1);
                    return;
                }

                // 未完成且是AD Slot → 显示锁定状态
                if (!this._info.isComplete() && adSlotIndex) {
                    this.nodeLock.active = true;

                    // 计算并格式化锁定时间
                    const openTime = PowerGemManager.instance.getPowerGemOpenTime(this._info.getPowerGemGradeType());
                    const hour = Math.floor(openTime / 60);
                    const minute = Math.floor(openTime % 60);
                    let timeStr = "";

                    if (hour > 0) {
                        timeStr += "%sh".format(hour.toString());
                    }
                    if (hour > 0 && minute > 0) {
                        timeStr += " ";
                    }
                    if (minute > 0) {
                        timeStr += "%sm".format(minute.toString());
                    }

                    this.lblLock.string = timeStr;
                } else {
                    // 已完成 → 显示打开状态
                    this.nodeOpen.active = true;
                }
            } else {
                // 空状态
                this.nodeEmpty.active = true;
            }
        } else {
            // 信息无效 → 空状态
            this.nodeEmpty.active = true;
        }
    }

    /**
     * 播放Slot项动画
     */
    playAnimation(): void {
        if (TSUtility.isValid(this._info) && !this._info.isEmpty()) {
            // 播放发光动画
            if (this._arrAnimGlow.length > 0) {
                this._arrAnimGlow.forEach((anim: cc.Animation) => {
                    if (TSUtility.isValid(anim)) {
                        anim.setCurrentTime(0);
                        anim.play(this.ANIMATION_NAME_GLOW, 0);
                    }
                });
            }

            // 播放点击动画
            if (TSUtility.isValid(this.animTap)) {
                this.animTap.setCurrentTime(0);
                this.animTap.play(this.ANIMATION_NAME_TAP, 0);
            }
        }
    }

    /**
     * 设置剩余时间UI显示
     */
    setRemainTimeUI(): void {
        if (this._remainTimeFormat.getTime() >= 0) {
            // 剩余时间有效 → 更新时间文本
            if (TSUtility.isValid(this.lblTime)) {
                this.lblTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(this._numRemainTime);
            }
            if (TSUtility.isValid(this.lblUpgradeTime)) {
                this.lblUpgradeTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(this._numRemainTime);
            }
        } else {
            // 剩余时间无效 → 隐藏时间相关节点，显示打开节点
            this.nodeTime.active = false;
            this.nodeUpgrade.active = false;
            this.nodeTimeFrame.active = false;
            this.nodeOpen.active = true;
        }
    }

    /**
     * 更新剩余时间（倒计时逻辑）
     */
    updateRemainTime(): void {
        // 计算服务器剩余时间差值
        const serverRemainTime = this.getServerRemainTime();
        const timeDiff = this._numRemainTime - serverRemainTime;

        // 更新时间格式和剩余时间
        this._remainTimeFormat.addSecond(-timeDiff);
        this._numRemainTime -= timeDiff;

        // 限制剩余时间不超过最大值
        if (this._numRemainTime >= this._numRemainMaxTime) {
            this._numRemainTime = this._numRemainMaxTime;
        }

        // 更新UI
        this.setRemainTimeUI();

        // 剩余时间≤0时停止倒计时
        if (this._remainTimeFormat.getTime() <= 0) {
            this.unscheduleAllCallbacks();
            this.nodeTime.active = false;
            this.nodeUpgrade.active = false;
            this.nodeTimeFrame.active = false;
            this.nodeOpen.active = true;
            return;
        }
    }

    /**
     * 获取服务器剩余时间
     * @returns 服务器剩余秒数
     */
    getServerRemainTime(): number {
        const currentServerTime = TSUtility.getServerBaseNowUnixTime();
        return this._numExpireDate - currentServerTime;
    }

    /**
     * 设置选中状态
     * @param selectIndex 选中的Slot索引
     */
    setSelect(selectIndex: number): void {
        this.nodeSelect.active = selectIndex === this._numSlotIndex;

        // 播放选中/停止动画
        if (TSUtility.isValid(this.animSlot)) {
            this.animSlot.setCurrentTime(0);
            if (selectIndex === this._numSlotIndex) {
                this.animSlot.play(this.ANIMATION_NAME_SELECT, 0);
            } else {
                this.animSlot.play(this.ANIMATION_NAME_STOP, 0);
            }
        }
    }

    /**
     * Slot项点击事件 - 触发回调并播放音效
     */
    onClick_Slot(): void {
        if (TSUtility.isValid(this._onClickSlot)) {
            GameCommonSound.playFxOnce("btn_etc");
            this._onClickSlot(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex);
        }
    }
}