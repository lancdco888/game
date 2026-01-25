import DialogBase, { DialogState } from "../DialogBase";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import GameCommonSound from "../GameCommonSound";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import { Utility } from "../global_utility/Utility";
import PopupManager from "../manager/PopupManager";
import PowerGemManager, { PowerGemGradeType } from "../manager/PowerGemManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import PowerGemInfoPopup from "./PowerGemInfoPopup";
import PowerGemSlotItem from "./PowerGemSlotItem";
import PowerGemSlotPopup_Main from "./PowerGemSlotPopup_Main";
import PowerGemSlotPopup_Tutorial from "./PowerGemSlotPopup_Tutorial";
import PowerGemSlotPopup_Upgrade from "./PowerGemSlotPopup_Upgrade";

const { ccclass, property } = cc._decorator;

// ===================== 顶部导入所有外部模块 =====================


/**
 * PowerGem老虎机弹窗打开类型枚举
 */
export enum PowerGemSlotOpenType {
    SLOT_MAIN = "SLOT_MAIN",
    SLOT_START = "SLOT_START",
    SLOT_AD = "SLOT_AD",
    SLOT_UPGRADE = "SLOT_UPGRADE"
}

/**
 * PowerGem等级激活节点类
 */
@ccclass()
export class PowerGemSlotActiveNode {
    @property({ type: cc.Integer, displayName: "等级" })
    public grade: number = 0;

    @property({ type: [cc.Node], displayName: "激活节点数组" })
    public arrActiveNode: cc.Node[] = [];
}

/**
 * PowerGem老虎机弹窗组件 (核心弹窗控制+多状态管理)
 * PowerGemSlotPopup
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemSlotPopup extends DialogBase {
    // ===================== 动画常量 【与原JS完全一致】 =====================
    private readonly ANIMATION_NAME_OPEN: string = "Popup_Ani";
    private readonly ANIMATION_NAME_PAGE: string = "Page_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN: string = "Gem_Open_Ani";
    private readonly ANIMATION_NAME_GEM_PAGE: string = "Gem_Page_Ani";
    private readonly ANIMATION_NAME_GEM_LOOP: string = "Gem_Loop_Ani";
    private readonly ANIMATION_NAME_GEM_COMPLETE: string = "Spark_FX_Ani";

    // ===================== 等级颜色常量 【与原JS完全一致】 =====================
    private readonly GRADE_COLOR: cc.Color[] = [
        cc.color(0, 144, 255),    // 等级0
        cc.color(0, 168, 0),      // 等级1
        cc.color(237, 0, 0),      // 等级2
        cc.color(255, 149, 0),    // 等级3
        cc.color(255, 0, 255)     // 等级4
    ];

    // ===================== Cocos 序列化属性 【与原JS 1:1精准对应】 =====================
    @property({ type: cc.Node, displayName: "触摸遮罩节点" })
    public nodeTouchBG: cc.Node = null;

    @property({ type: cc.Node, displayName: "空状态节点" })
    public nodeEmpty: cc.Node = null;

    @property({ type: cc.Node, displayName: "通用节点" })
    public nodeCommon: cc.Node = null;

    @property({ type: cc.Node, displayName: "奖励面板节点" })
    public nodeRewardBoard: cc.Node = null;

    @property({ type: cc.Node, displayName: "时间节点" })
    public nodeTime: cc.Node = null;

    @property({ type: cc.Node, displayName: "宝石UI节点" })
    public nodeGemUI: cc.Node = null;

    @property({ type: cc.Layout, displayName: "Slot项布局节点" })
    public layout: cc.Layout = null;

    @property({ type: cc.Button, displayName: "信息按钮" })
    public btnInfo: cc.Button = null;

    @property({ type: PowerGemSlotPopup_Main, displayName: "主弹窗组件" })
    public main: PowerGemSlotPopup_Main = null;

    @property({ type: PowerGemSlotPopup_Upgrade, displayName: "升级弹窗组件" })
    public upgrade: PowerGemSlotPopup_Upgrade = null;

    @property({ displayName: "教程组件" })
    public tutorial: PowerGemSlotPopup_Tutorial = null;

    @property({ type: [cc.Node], displayName: "等级节点数组" })
    public arrLevel: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: "颜色节点数组" })
    public arrColorNode: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: "事件时间1节点数组" })
    public arrEventTime_1: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: "事件时间2节点数组" })
    public arrEventTime_2: cc.Node[] = [];

    @property({ type: [cc.Label], displayName: "事件时间文本数组" })
    public arrEventTime: cc.Label[] = [];

    @property({ type: [cc.Animation], displayName: "宝石动画数组" })
    public arrGemAnimation: cc.Animation[] = [];

    @property({ displayName: "激活节点数组" })
    public arrActiveNode: PowerGemSlotActiveNode[] = [];

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _anim: cc.Animation = null;
    private _arrSlotButton: PowerGemSlotItem[] = [];
    private _numCurIndex: number = -1;
    private _eCurType: PowerGemSlotOpenType = PowerGemSlotOpenType.SLOT_MAIN;
    private _remainEventTimeFormat: TimeFormatHelper = null;
    private _numRemainEventTime: number = 0;
    private _numExpireDate: number = 0;
    private _isEndGetEvent: boolean = false;

    // ===================== 静态方法 【弹窗实例获取】 =====================
    /**
     * 获取PowerGemSlotPopup实例
     * @param callback 获取完成回调 (error, instance)
     */
    public static getPopup(callback: (error: Error, instance: PowerGemSlotPopup) => void): void {
        const resPath = "Service/01_Content/PowerGem/PowerGemSlotPopup";
        cc.loader.loadRes(resPath, (error: Error, prefab: cc.Prefab) => {
            if (error) {
                // 错误日志上报
                const err = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err));
                callback && callback(error, null);
                return;
            }

            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupInstance = popupNode.getComponent(PowerGemSlotPopup);
                popupNode.active = false;
                callback(null, popupInstance);
            }
        });
    }

    // ===================== 核心方法 【1:1还原原JS逻辑】 =====================
    /**
     * 初始化弹窗组件
     */
    public initialize(): void {
        // 初始化弹窗基类
        this.initDailogBase();
        
        // 获取弹窗动画组件
        this._anim = this.rootNode.getComponent(cc.Animation);

        // 初始化所有Slot项
        this.layout.node.children.forEach((childNode: cc.Node, index: number) => {
            const slotItem = childNode.getComponent(PowerGemSlotItem);
            slotItem.initialize(this.setSlotInfoUI.bind(this), index);
            this._arrSlotButton.push(slotItem);
        });

        // 设置触摸遮罩大小为Canvas大小
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        this.nodeTouchBG.setContentSize(canvasNode.getContentSize());

        // 初始化子弹窗组件
        this.main.initialize(this.setSlotInfoUI.bind(this), this.playGemAnimation.bind(this));
        this.upgrade.initialize(this.setSlotInfoUI.bind(this), this.close.bind(this));

        // 绑定信息按钮点击事件
        this.btnInfo.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotPopup", "onClick_Info", ""));

        // 隐藏教程组件
        this.tutorial.node.active = false;
    }

    /**
     * 打开弹窗
     * @param openType 打开类型
     * @param slotIndex Slot索引
     * @returns 弹窗实例
     */
    public open(openType: PowerGemSlotOpenType, slotIndex: number): PowerGemSlotPopup {
        // 索引无效时关闭弹窗
        if (slotIndex < 0 || slotIndex >= PowerGemManager.instance.getPowerGemMaxSlotCount()) {
            this.close();
            return this;
        }

        // 播放打开音效
        GameCommonSound.playFxOnce("pop_etc");
        
        // 初始化组件
        this.initialize();
        
        // 重置PowerGem管理器状态
        PowerGemManager.instance.setRefreshPromotion(false);
        PowerGemManager.instance.setFinishUpgrade(false);

        // 设置Slot信息UI
        this.setSlotInfoUI(openType, slotIndex);
        
        // 更新事件时间
        this.updateEventTime();
        
        // 控制触摸遮罩显隐（升级类型时显示）
        this.nodeTouchBG.active = openType === PowerGemSlotOpenType.SLOT_UPGRADE;

        // 播放打开动画
        this._anim.play(this.ANIMATION_NAME_OPEN, 0);
        this._anim.once("finished", () => {
            if (openType === PowerGemSlotOpenType.SLOT_UPGRADE) {
                this.nodeTouchBG.active = false;
            }
        });

        // 打开弹窗（基类方法）
        this._open(null, true);

        return this;
    }

    /**
     * 更新事件时间（倒计时初始化）
     */
    public updateEventTime(): void {
        // 判断是否为PowerGem开放日期
        const isOpenDate = PowerGemManager.instance.isPowerGemOpenDate();
        
        // 获取过期时间
        this._numExpireDate = isOpenDate 
            ? PowerGemManager.instance.getPowerGemOpenableExpireDate() 
            : PowerGemManager.instance.getPowerGemGetableExpireDate();
        
        // 计算剩余时间
        this._numRemainEventTime = this._numExpireDate - TSUtility.getServerBaseNowUnixTime();
        this._remainEventTimeFormat = new TimeFormatHelper(this._numRemainEventTime);

        // 更新剩余时间并启动倒计时
        this.updateRemainEventTime();
        this.schedule(this.updateRemainEventTime, 1);
    }

    /**
     * 更新剩余事件时间（倒计时逻辑）
     */
    public updateRemainEventTime(): void {
        // 计算服务器剩余时间差值
        const serverRemainTime = this.getServerRemainEventTime();
        const timeDiff = this._numRemainEventTime - serverRemainTime;

        // 更新时间格式和剩余时间
        this._remainEventTimeFormat.addSecond(-timeDiff);
        this._numRemainEventTime -= timeDiff;

        // 判断是否为PowerGem开放日期
        const isOpenDate = PowerGemManager.instance.isPowerGemOpenDate();

        // 未结束获取事件且进入开放日期 → 重置状态并更新UI
        if (!this._isEndGetEvent && isOpenDate) {
            this._isEndGetEvent = true;
            this.updateEventTime();
            this.setSlotInfoUI(PowerGemSlotOpenType.SLOT_MAIN, this._numCurIndex, true);
            return;
        }

        // 更新结束获取事件状态
        this._isEndGetEvent = isOpenDate;

        // 剩余时间>0时更新UI
        if (this._numRemainEventTime > 0) {
            // 控制事件时间节点显隐
            this.arrEventTime_1.forEach((node: cc.Node) => {
                node.active = !isOpenDate;
            });
            this.arrEventTime_2.forEach((node: cc.Node) => {
                node.active = isOpenDate;
            });

            // 更新事件时间文本
            this.arrEventTime.forEach((label: cc.Label) => {
                if (TSUtility.isValid(label)) {
                    const timeStr = isOpenDate 
                        ? ` (EXPIRES IN ${TimeFormatHelper.getTimeStringDayBaseHourFormatBig(this._numRemainEventTime)})` 
                        : TimeFormatHelper.getTimeStringDayBaseHourFormatBig(this._numRemainEventTime);
                    label.string = timeStr;
                }
            });
        } else {
            // 剩余时间≤0时关闭弹窗
            this.close();
        }
    }

    /**
     * 获取服务器剩余事件时间
     * @returns 服务器剩余秒数
     */
    public getServerRemainEventTime(): number {
        const currentServerTime = TSUtility.getServerBaseNowUnixTime();
        return this._numExpireDate - currentServerTime;
    }

    /**
     * 设置Slot信息UI
     * @param openType 打开类型
     * @param slotIndex Slot索引
     * @param forceUpdate 是否强制更新
     */
    public setSlotInfoUI(openType: PowerGemSlotOpenType, slotIndex: number, forceUpdate: boolean = false): void {
        // 非强制更新且索引未变化时不执行
        if (!forceUpdate && this._numCurIndex === slotIndex) {
            return;
        }

        // 重置所有节点显隐状态
        this.nodeEmpty.active = false;
        this.nodeCommon.active = false;
        this.main.node.active = false;
        this.upgrade.node.active = false;
        this.nodeGemUI.active = true;

        // 更新所有Slot项并设置选中状态
        this._arrSlotButton.forEach((slotItem: PowerGemSlotItem) => {
            slotItem.updateSlotItem();
            slotItem.setSelect(slotIndex);
        });

        // 获取当前Slot的PowerGem信息
        const powerGemInfo = PowerGemManager.instance.getPowerGemInfo(slotIndex);

        // 信息无效或空状态 → 显示空节点
        if (!TSUtility.isValid(powerGemInfo) || powerGemInfo.isEmpty()) {
            this.nodeEmpty.active = true;
            this._numCurIndex = slotIndex;
            this._eCurType = openType;
            return;
        }

        // 调整打开类型（START/AD类型转为MAIN）
        if (openType === PowerGemSlotOpenType.SLOT_START || openType === PowerGemSlotOpenType.SLOT_AD) {
            openType = PowerGemSlotOpenType.SLOT_MAIN;
        }

        // MAIN类型且满足升级条件 → 转为UPGRADE类型
        if (openType === PowerGemSlotOpenType.SLOT_MAIN 
            && PowerGemManager.instance.isUpgradeAllows() 
            && powerGemInfo.isOpening() 
            && !PowerGemManager.instance.isPowerGemOpenDate()) {
            openType = PowerGemSlotOpenType.SLOT_UPGRADE;
        }

        // 获取PowerGem等级类型
        const gradeType = powerGemInfo.getPowerGemGradeType();

        // 显示通用节点
        this.nodeCommon.active = true;

        // 索引变化时更新等级和等级UI
        if (this._numCurIndex !== slotIndex) {
            this.setGradeUI(gradeType);
            this.setLevelUI(powerGemInfo.getPowerGemLevel(), powerGemInfo.getPowerGemLevelGradeType());
        }

        // 控制奖励面板和时间节点显隐
        this.nodeRewardBoard.active = openType !== PowerGemSlotOpenType.SLOT_UPGRADE;
        this.nodeTime.active = openType === PowerGemSlotOpenType.SLOT_MAIN;

        // 根据打开类型处理不同逻辑
        if (openType === PowerGemSlotOpenType.SLOT_MAIN) {
            // MAIN类型 → 初始化主弹窗数据
            this.main.setData(slotIndex);
            
            // 播放对应宝石动画
            if (powerGemInfo.isComplete()) {
                this.playGemAnimation(gradeType, this.ANIMATION_NAME_GEM_COMPLETE);
            } else if (this._numCurIndex === -1) {
                this.playGemAnimation(gradeType, this.ANIMATION_NAME_GEM_OPEN);
            } else if (this._numCurIndex !== slotIndex) {
                this.playGemAnimation(gradeType, this.ANIMATION_NAME_GEM_PAGE);
            }

            // 索引变化时播放页面切换动画
            if (this._numCurIndex >= 0 && this._numCurIndex !== slotIndex) {
                this._anim.play(this.ANIMATION_NAME_PAGE, 0);
            }
        } else if (openType === PowerGemSlotOpenType.SLOT_UPGRADE) {
            // UPGRADE类型 → 初始化升级弹窗数据
            this.upgrade.node.active = true;
            this.upgrade.setData(slotIndex);
            
            // 播放对应宝石动画
            if (this._numCurIndex === -1) {
                this.playGemAnimation(gradeType, this.ANIMATION_NAME_GEM_OPEN);
            } else {
                this.playGemAnimation(gradeType, this.ANIMATION_NAME_GEM_PAGE);
            }
        }

        // 更新当前索引和类型
        this._numCurIndex = slotIndex;
        this._eCurType = openType;

        // 教程逻辑处理
        const promotion = PowerGemManager.instance.getPromotion();
        const tutorialComplete = ServerStorageManager.getAsNumber(StorageKeyType.TUTORIAL_POWER_GEM_FIRST_OPEN);
        
        if (TSUtility.isValid(promotion) 
            && promotion.numEventEndDate > tutorialComplete 
            && UserInfo.instance().getCurrentSceneMode() === SDefine.Slot) {
            
            // 满足教程条件且未完成时显示教程
            if (this._eCurType === PowerGemSlotOpenType.SLOT_MAIN 
                && !powerGemInfo.isEmpty() 
                && !powerGemInfo.isOpening() 
                && !powerGemInfo.isComplete()) {
                this.tutorial.node.active = true;
                this.tutorial.playPowerGemTutorial_FirstOpenPowerGem(slotIndex, this.main);
            } else {
                this.tutorial.node.active = false;
            }
        } else {
            this.tutorial.node.active = false;
        }
    }

    /**
     * 设置等级UI
     * @param gradeType 等级类型
     */
    public setGradeUI(gradeType: number): void {
        // 设置颜色节点颜色
        this.arrColorNode.forEach((colorNode: cc.Node) => {
            // 神话等级特殊颜色处理
            if (gradeType === PowerGemGradeType.MYTHICAL && colorNode.name === "80_gem_stage_Light") {
                colorNode.color = cc.color(0, 255, 255);
            } else {
                colorNode.color = this.GRADE_COLOR[gradeType];
            }
        });

        // 设置激活节点显隐
        this.arrActiveNode.forEach((activeNode: PowerGemSlotActiveNode) => {
            activeNode.arrActiveNode.forEach((node: cc.Node) => {
                node.active = activeNode.grade === gradeType;
            });
        });
    }

    /**
     * 设置等级等级UI
     * @param level 等级
     * @param levelGradeType 等级等级类型
     */
    public setLevelUI(level: number, levelGradeType: number): void {
        this.arrLevel.forEach((levelNode: cc.Node) => {
            if (TSUtility.isValid(levelNode)) {
                // 设置等级等级子节点显隐
                levelNode.children.forEach((childNode: cc.Node, index: number) => {
                    if (TSUtility.isValid(childNode)) {
                        childNode.active = index === levelGradeType - 1;
                    }
                });

                // 更新等级文本
                const fontLevelNode = levelNode.getChildByName("Font_Level");
                if (TSUtility.isValid(fontLevelNode)) {
                    const levelLabel = fontLevelNode.getComponent(cc.Label);
                    if (TSUtility.isValid(levelLabel)) {
                        fontLevelNode.active = true;
                        levelLabel.string = level.toString();
                    }
                }
            }
        });
    }

    /**
     * 播放宝石动画
     * @param gradeType 等级类型
     * @param animName 动画名称
     */
    public playGemAnimation(gradeType: number, animName: string): void {
        const gemAnim = this.arrGemAnimation[gradeType];
        if (TSUtility.isValid(gemAnim)) {
            // 播放指定动画
            gemAnim.play(animName, 0);

            // 打开/页面动画完成后播放循环动画
            if (animName === this.ANIMATION_NAME_GEM_OPEN || animName === this.ANIMATION_NAME_GEM_PAGE) {
                gemAnim.once("finished", () => {
                    gemAnim.play(this.ANIMATION_NAME_GEM_LOOP, 0);
                });
            }
        }
    }

    /**
     * 信息按钮点击事件
     */
    public onClick_Info(): void {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 打开信息弹窗
        PowerGemInfoPopup.getPopup((error: Error, infoPopup: PowerGemInfoPopup) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (!error) {
                infoPopup.open();
            }
        });
    }

    /**
     * 返回按钮处理
     * @returns 处理结果
     */
    public onBackBtnProcess(): boolean {
        // 触摸遮罩激活/正在收集动画/关闭弹窗
        return this.nodeTouchBG.active 
            || this.main.getPlayCollectAction() 
            || this.closeBackBtnProcess();
    }

    /**
     * 关闭弹窗
     */
    public close(): void {
        if (!this.isStateClose()) {
            let changeResult = null;

            // 重置所有AD Slot索引和变化结果
            for (let i = 0; i < PowerGemManager.instance.getPowerGemMaxSlotCount(); i++) {
                PowerGemManager.instance.setADSlotIndex(i, false);
                const result = PowerGemManager.instance.getChangeResult(i);
                
                PowerGemManager.instance.setChangeResult(i, null);
                
                // 筛选有效变化结果
                if (TSUtility.isValid(result) && TSUtility.isValid(result.key)) {
                    if (PowerGemManager.instance.getApplyChangeResultTime() >= result.value) {
                        continue;
                    }
                    if (!TSUtility.isValid(changeResult) || changeResult.value <= result.value) {
                        changeResult = {
                            key: result.key,
                            value: result.value
                        };
                    }
                }
            }

            // 应用变化结果
            if (TSUtility.isValid(changeResult)) {
                // UserInfo.instance().applyChangeResult(changeResult.key);
            }

            // 重置PowerGem管理器状态
            PowerGemManager.instance.setActionPowerGemInfo(null);
            PowerGemManager.instance.setApplyChangeResultTime(0);

            // 清除所有调度器
            this.unscheduleAllCallbacks();
            
            // 设置弹窗状态为关闭
            this.setState(DialogState.Close);
            
            // 清理资源
            this.clear();
            
            // 关闭弹窗（基类方法）
            this._close(cc.fadeOut(0.15));
        }
    }
}