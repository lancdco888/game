const { ccclass, property } = cc._decorator;


import PayCode from "../../../Script/Config/PayCode";
import GameCommonSound from "../../../Script/GameCommonSound";
import HRVSlotService from "../../../Script/HRVService/HRVSlotService";
import Analytics from "../../../Script/Network/Analytics";
import CommonServer from "../../../Script/Network/CommonServer";
import UserInfo from "../../../Script/User/UserInfo";
import { PowerGemPromotion } from "../../../Script/User/UserPromotion";
import AdsManager, { PlacementID_Type } from "../../../Script/Utility/AdsManager";
import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import CommonSoundSetter from "../../../Script/global_utility/CommonSoundSetter";
import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import TimeFormatHelper from "../../../Script/global_utility/TimeFormatHelper";
import { Utility } from "../../../Script/global_utility/Utility";
import PopupManager from "../../../Script/manager/PopupManager";
import PowerGemManager from "../../../Script/manager/PowerGemManager";
import SoundManager from "../../../Script/manager/SoundManager";
import { CommonRewardButtonType, CommonRewardTitleInfo, CommonRewardTitleType } from "./CommonRewardEnum";
import CommonRewardPopup from "./CommonRewardPopup";
import { PowerGemSlotOpenType } from "./PowerGemSlotPopup";

/**
 * PowerGem收集等级配置类
 * 对应不同等级的收集动画/UI配置
 */
@ccclass("PowerGemSlotCollect")
export class PowerGemSlotCollect {
    @property({ type: cc.Integer, displayName: "等级" })
    public grade: number = 0;

    @property({ type: cc.Node, displayName: "根节点" })
    public nodeRoot: cc.Node = null;

    @property({ type: cc.Node, displayName: "等级显示节点" })
    public nodeLevelGrade: cc.Node = null;

    @property({ type: cc.Animation, displayName: "动画组件" })
    public ani: cc.Animation = null;
}

/**
 * PowerGem老虎机弹窗主逻辑组件
 * 核心功能：弹窗UI更新、奖励计算、动画播放、按钮交互、广告触发、服务器通信
 */
@ccclass()
export default class PowerGemSlotPopup_Main extends cc.Component {
    // ===================== 动画名称常量（与原JS完全一致） =====================
    private readonly ANIMATION_NAME_COMPLETE: string = "Spark_FX_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN_NORMAL: string = "Gem_Open_Normal_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN_SPECIAL: string = "Gem_Open_Special_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN_REWARD_1: string = "Get_Reward_01_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN_REWARD_2: string = "Get_Reward_02_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN_REWARD_3: string = "Get_Reward_03_Ani";
    private readonly ANIMATION_NAME_GEM_OPEN_NAME: string = "Gems_Open_Ani";

    // ===================== Cocos 序列化属性 【与原JS 1:1精准对应】 =====================
    @property({ type: cc.Node, displayName: "触摸背景节点" })
    public nodeTouchBG: cc.Node = null;

    @property({ type: cc.Node, displayName: "宝石UI节点" })
    public nodeGemUI: cc.Node = null;

    @property({ type: cc.Node, displayName: "时间显示节点" })
    public nodeTime: cc.Node = null;

    @property({ type: cc.Node, displayName: "奖励遮罩节点" })
    public nodeRewardDim: cc.Node = null;

    @property({ type: cc.Node, displayName: "奖励根节点" })
    public nodeRewardRoot: cc.Node = null;

    @property({ type: cc.Node, displayName: "奖励-JokerPoint节点" })
    public nodeReward_JokerPoint: cc.Node = null;

    @property({ type: cc.Node, displayName: "奖励-卡牌包节点" })
    public nodeReward_CardPack: cc.Node = null;

    @property({ type: cc.Label, displayName: "时间文本" })
    public lblTime: cc.Label = null;

    @property({ type: cc.Label, displayName: "锁定文本" })
    public lblLock: cc.Label = null;

    @property({ type: cc.Label, displayName: "金币文本" })
    public lblCoin: cc.Label = null;

    @property({ type: cc.Label, displayName: "JokerPoint文本" })
    public lblJokerPoint: cc.Label = null;

    @property({ type: cc.Label, displayName: "卡牌包文本" })
    public lblCardPack: cc.Label = null;

    @property({ type: cc.Label, displayName: "奖励JokerPoint文本" })
    public lblRewardJokerPoint: cc.Label = null;

    @property({ type: cc.Label, displayName: "奖励卡牌包文本" })
    public lblRewardCardPack: cc.Label = null;

    @property({ type: cc.Button, displayName: "开始按钮" })
    public btnStart: cc.Button = null;

    @property({ type: cc.Button, displayName: "广告按钮" })
    public btnAD: cc.Button = null;

    @property({ type: cc.Button, displayName: "打开按钮" })
    public btnOpen: cc.Button = null;

    @property({ type: cc.Button, displayName: "收集按钮" })
    public btnCollect: cc.Button = null;

    @property({ type: cc.Animation, displayName: "通用动画组件" })
    public animCommon: cc.Animation = null;

    @property({ type: cc.Animation, displayName: "弹窗动画组件" })
    public animPopup: cc.Animation = null;

    @property({ type: [PowerGemSlotCollect], displayName: "收集配置数组" })
    public arrCollect: PowerGemSlotCollect[] = [];

    @property({ type: [cc.Node], displayName: "卡牌包节点数组" })
    public arrCardPack: cc.Node[] = [];

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _remainTimeFormat: TimeFormatHelper = null; // 剩余时间格式化工具
    private _numRemainMaxTime: number = 0; // 最大剩余时间（秒）
    private _numRemainTime: number = 0; // 当前剩余时间（秒）
    private _numExpireDate: number = 0; // 过期时间戳
    private _numSlotIndex: number = 0; // Slot索引
    private _setUI: (type: PowerGemSlotOpenType, index: number, refresh: boolean) => void = null; // UI更新回调
    private _gemAni: (gradeType: number, aniName: string) => void = null; // 宝石动画播放回调
    private _isFailedAD: boolean = false; // 广告播放失败标记
    private _changeResult: { key: any, value: any } = null; // 服务器变更结果
    private _isPlayCollectAction: boolean = false; // 收集动画播放标记
    private _soundSetter: CommonSoundSetter = null; // 音效设置器

    // ===================== Getter 【与原JS一致】 =====================
    get setUI(): (type: PowerGemSlotOpenType, index: number, refresh: boolean) => void {
        return this._setUI;
    }

    // ===================== 核心初始化方法 =====================
    /**
     * 初始化组件
     * @param setUICallback UI更新回调
     * @param gemAniCallback 宝石动画播放回调
     */
    public initialize(setUICallback: (type: PowerGemSlotOpenType, index: number, refresh: boolean) => void, gemAniCallback: (gradeType: number, aniName: string) => void): void {
        this._setUI = setUICallback;
        this._gemAni = gemAniCallback;

        // 绑定按钮点击事件
        this.btnStart.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotPopup_Main", "onClick_Start", ""));
        this.btnAD.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotPopup_Main", "onClick_AD", ""));
        this.btnOpen.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotPopup_Main", "onClick_Open", ""));
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotPopup_Main", "onClick_Collect", ""));

        // 获取音效设置组件
        this._soundSetter = this.node.getComponent(CommonSoundSetter);

        // 禁用宝石显示
        this.onDisableGem();
    }

    /**
     * 设置弹窗数据并更新UI
     * @param slotIndex Slot索引
     */
    public setData(slotIndex: number): void {
        this.node.active = false;
        this._numSlotIndex = slotIndex;
        
        this.onDisableGem();
        this.setRewardUI();
        this.updateUI();
    }

    /**
     * 获取收集动画播放状态
     */
    public getPlayCollectAction(): boolean {
        return this._isPlayCollectAction;
    }

    /**
     * 禁用宝石显示（重置收集动画）
     */
    public onDisableGem(): void {
        this.arrCollect.forEach((collectItem) => {
            collectItem.ani.setCurrentTime(0);
            collectItem.nodeRoot.active = false;
        });
    }

    // ===================== UI更新核心逻辑 =====================
    /**
     * 更新弹窗UI（核心方法，处理不同状态下的UI显示）
     */
    public async updateUI(): Promise<void> {
        // 清空所有定时器
        this.unscheduleAllCallbacks();
        
        // 播放通用奖励动画
        this.animCommon.play(this.ANIMATION_NAME_GEM_OPEN_REWARD_3, 0);

        // 获取PowerGem信息和AD Slot索引
        const powerGemInfo = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);
        const adSlotIndex = PowerGemManager.instance.getADSlotIndex(this._numSlotIndex);

        // 初始化基础UI状态
        this.nodeTime.active = false;
        this.btnCollect.node.active = false;

        // 判断状态：开启中/锁定/完成
        if (this.isOpening(powerGemInfo)) {
            this.nodeTime.active = true;
        } else if (this.isLock(powerGemInfo)) {
            this.nodeTime.active = true;
        } else {
            this.isComplete(powerGemInfo);
        }

        // 延迟0.01秒确保数据加载完成
        await AsyncHelper.delayWithComponent(0.01, this);

        // 激活节点并重置UI状态
        this.node.active = true;
        this._isPlayCollectAction = false;
        this.lblTime.node.active = false;
        this.lblLock.node.active = false;
        this.btnStart.node.active = false;
        this.btnAD.node.active = false;
        this.btnOpen.node.active = false;
        this.nodeRewardDim.active = false;
        this._isFailedAD = false;
        this.nodeRewardRoot.setScale(0);

        // 根据不同状态更新UI
        if (this.isOpening(powerGemInfo)) {
            // 状态1：宝石开启中
            this.lblTime.node.active = true;
            this._numExpireDate = powerGemInfo.getPowerGemClearDate();
            this._numRemainTime = this._numExpireDate - TSUtility.getServerBaseNowUnixTime();
            this._remainTimeFormat = new TimeFormatHelper(this._numRemainTime);

            // 获取宝石开启时间
            const openTime = PowerGemManager.instance.getPowerGemOpenTime(powerGemInfo.getPowerGemGradeType());
            this._numRemainMaxTime = 60 * openTime;

            // 启动剩余时间更新定时器
            this.updateRemainTime();
            this.schedule(this.updateRemainTime, 1);

            // // 移动端/FB小游戏且广告就绪，剩余时间<=10分钟时显示广告按钮
            // if ((!Utility.isFacebookInstant() && !Utility.isMobileGame()) || 
            //     (Utility.isReadyRewardedAD() && this._numRemainTime <= 600)) {
            //     this.btnAD.node.active = true;
            //     this.btnAD.node.opacity = 255;
            // }
        } else if (this.isLock(powerGemInfo)) {
            // 状态2：宝石锁定中
            this.lblLock.node.active = true;
            
            // 计算锁定时间
            const openTime = PowerGemManager.instance.getPowerGemOpenTime(powerGemInfo.getPowerGemGradeType());
            const hour = Math.floor(openTime / 60);
            const minute = Math.floor(openTime % 60);
            
            // 格式化锁定时间文本
            let lockText = "";
            if (hour > 0) lockText += `${hour.toString()}h`;
            if (hour > 0 && minute > 0) lockText += " ";
            if (minute > 0) lockText += `${minute.toString()}m`;
            
            // 更新锁定文本和开始按钮状态
            const isOpen = PowerGemManager.instance.isOpenPowerGemSlot();
            this.lblLock.string = lockText;
            this.btnStart.interactable = isOpen;
            this.btnStart.node.active = isOpen;
            this.btnStart.node.opacity = 255;

            // 未开启时轮询检查
            if (!isOpen) {
                this.schedule(() => {
                    if (PowerGemManager.instance.isOpenPowerGemSlot()) {
                        this.btnStart.node.active = true;
                        this.btnStart.interactable = true;
                        this.unscheduleAllCallbacks();
                    }
                }, 1);
            }
        } else if (this.isComplete(powerGemInfo)) {
            // 状态3：宝石已完成
            this.btnOpen.node.active = !adSlotIndex;
            if (this.btnOpen.node.active) {
                this.btnOpen.node.opacity = 255;
            }
            this.btnAD.node.active = false;

            // 移动端/FB小游戏且广告就绪时显示广告按钮
            if ((!Utility.isFacebookInstant() && !Utility.isMobileGame()) || 
                (adSlotIndex)) {
                this.btnAD.node.active = adSlotIndex;
            }
        }
    }

    /**
     * 判断宝石是否处于开启中状态
     * @param powerGemInfo PowerGem信息对象
     */
    private isOpening(powerGemInfo: any): boolean {
        const adSlotIndex = PowerGemManager.instance.getADSlotIndex(this._numSlotIndex);
        return powerGemInfo.isOpening() === 1 && 
               powerGemInfo.getPowerGemDuplicateLevel() < 3 && 
               !adSlotIndex;
    }

    /**
     * 判断宝石是否处于锁定状态
     * @param powerGemInfo PowerGem信息对象
     */
    private isLock(powerGemInfo: any): boolean {
        return powerGemInfo.isLock() === 1;
    }

    /**
     * 判断宝石是否已完成
     * @param powerGemInfo PowerGem信息对象
     */
    private isComplete(powerGemInfo: any): boolean {
        const adSlotIndex = PowerGemManager.instance.getADSlotIndex(this._numSlotIndex);
        return powerGemInfo.isComplete() === 1 || 
               powerGemInfo.getPowerGemDuplicateLevel() >= 3 || 
               adSlotIndex;
    }

    // ===================== 奖励UI设置 =====================
    /**
     * 设置奖励UI（金币、JokerPoint、卡牌包）
     */
    private setRewardUI(): void {
        const powerGemInfo = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);
        const duplicateLevel = powerGemInfo.getPowerGemDuplicateLevel();
        
        // 计算奖励金币
        let rewardCoin = PowerGemManager.instance.getPowerGemRewardCoin(
            powerGemInfo.getPowerGemGradeType(),
            powerGemInfo.getPowerGemLevel()
        );
        
        // 计算卡牌包数量
        let cardPackCount = 1;
        
        // 计算JokerPoint范围
        let jokerPointRange = PowerGemManager.instance.getJokerPointDate(powerGemInfo.getPowerGemGradeType());

        // 根据重复等级翻倍奖励
        if (duplicateLevel >= 1) {
            cardPackCount *= 2;
            jokerPointRange = [2 * jokerPointRange[0], 2 * jokerPointRange[1]];
        }
        if (duplicateLevel >= 2) {
            rewardCoin += 0.5 * rewardCoin;
        }

        // 更新奖励文本
        this.lblCoin.string = CurrencyFormatHelper.formatNumber(rewardCoin);
        this.lblJokerPoint.string = `${jokerPointRange[0].toString()}~${jokerPointRange[1].toString()} PT`;
        this.lblCardPack.string = `${cardPackCount.toString()} EA`;
    }

    // ===================== 剩余时间更新 =====================
    /**
     * 设置剩余时间UI
     */
    private setRemainTimeUI(): void {
        if (this._remainTimeFormat.getTime() >= 0) {
            // 更新剩余时间文本
            if (TSUtility.isValid(this.lblTime)) {
                this.lblTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(this._numRemainTime);
            }

            // 显示广告按钮（剩余时间<=10分钟且广告就绪）
            // if ((!Utility.isFacebookInstant() && !Utility.isMobileGame()) || 
            //     (Utility.isReadyRewardedAD() && !this.btnAD.node.active && this._numRemainTime <= 600 && !this._isFailedAD)) {
            //     this.btnAD.node.active = true;
            //     this.btnAD.node.opacity = 255;
            // }
        } else {
            // 时间到期，更新UI并播放完成动画
            this.updateUI();
            const powerGemInfo = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);
            if (!TSUtility.isValid(powerGemInfo)) return;
            
            this._gemAni(powerGemInfo.getPowerGemGradeType(), this.ANIMATION_NAME_COMPLETE);
        }
    }

    /**
     * 更新剩余时间（定时器调用）
     */
    private updateRemainTime(): void {
        // 计算服务器剩余时间差值
        const serverRemainTime = this.getServerRemainTime();
        const timeDiff = this._numRemainTime - serverRemainTime;

        // 更新剩余时间
        this._remainTimeFormat.addSecond(-timeDiff);
        this._numRemainTime -= timeDiff;

        // 限制最大剩余时间
        if (this._numRemainTime > this._numRemainMaxTime) {
            this._numRemainTime = this._numRemainMaxTime;
        }

        // 更新UI
        this.setRemainTimeUI();

        // 时间到期处理
        if (this._remainTimeFormat.getTime() <= 0) {
            this.unscheduleAllCallbacks();
            this.updateUI();
            
            const powerGemInfo = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);
            if (!TSUtility.isValid(powerGemInfo)) return;
            
            this._gemAni(powerGemInfo.getPowerGemGradeType(), this.ANIMATION_NAME_COMPLETE);
        }
    }

    /**
     * 获取服务器剩余时间
     */
    private getServerRemainTime(): number {
        const currentServerTime = TSUtility.getServerBaseNowUnixTime();
        return this._numExpireDate - currentServerTime;
    }

    // ===================== 收集动画播放 =====================
    /**
     * 播放收集奖励动画（核心动画逻辑）
     */
    public async playCollect(): Promise<void> {
        const powerGemInfo = PowerGemManager.instance.getPowerGemInfo(this._numSlotIndex);
        
        // 查找对应等级的收集配置
        const collectConfig = this.arrCollect.find(item => item.grade === powerGemInfo.getPowerGemGradeType());
        if (!TSUtility.isValid(collectConfig)) return;
        if (!TSUtility.isValid(collectConfig.nodeLevelGrade)) return;

        // 更新等级显示节点
        const levelGradeChildren = collectConfig.nodeLevelGrade.children;
        for (let i = 0; i < levelGradeChildren.length; i++) {
            if (TSUtility.isValid(levelGradeChildren[i])) {
                levelGradeChildren[i].active = i === powerGemInfo.getPowerGemLevelGradeType() - 1;
            }
        }

        // 更新等级文本
        const levelLabelNode = collectConfig.nodeLevelGrade.getChildByName("Font_Level");
        if (!TSUtility.isValid(levelLabelNode)) return;
        
        const levelLabel = levelLabelNode.getComponent(cc.Label);
        if (!TSUtility.isValid(levelLabel)) return;
        
        levelLabelNode.active = true;
        levelLabel.string = powerGemInfo.getPowerGemLevel().toString();

        // 激活收集根节点
        if (!TSUtility.isValid(collectConfig.nodeRoot)) return;
        collectConfig.nodeRoot.active = true;
        this.nodeGemUI.active = false;

        // 播放收集动画
        if (TSUtility.isValid(collectConfig.ani)) {
            this.nodeTouchBG.active = true;
            
            // 播放普通/特殊开启动画
            collectConfig.ani.play(
                powerGemInfo.getPowerGemDuplicateLevel() === 0 
                    ? this.ANIMATION_NAME_GEM_OPEN_NORMAL 
                    : this.ANIMATION_NAME_GEM_OPEN_SPECIAL,
                0
            );
            
            // 播放弹窗名称动画
            this.animPopup.play(this.ANIMATION_NAME_GEM_OPEN_NAME, 0);

            // 2秒后播放开启音效
            this.scheduleOnce(() => {
                SoundManager.Instance().playFxOnce(this._soundSetter.getAudioClip("POWERGEM_OPEN"), 0, 1);
            }, 2);

            // 延迟1秒
            await AsyncHelper.delayWithComponent(1, this);
        }

        // 获取服务器变更结果
        this._changeResult = PowerGemManager.instance.getChangeResult(this._numSlotIndex);
        if (!TSUtility.isValid(this._changeResult) || !TSUtility.isValid(this._changeResult.key)) return;

        // 计算JokerPoint奖励
        const jokerPointReward = this.getJokerPointByChangeResult(this._changeResult.key);
        this.lblRewardJokerPoint.string = `${jokerPointReward.toString()} JOKER POINTS`;
        this.nodeReward_JokerPoint.active = jokerPointReward > 0;

        // 计算卡牌包奖励
        const cardPackReward = this.getCardPackCountByChangeResult(this._changeResult.key);
        this.lblRewardCardPack.string = `${cardPackReward[0].toString()} STAR CARD PACK X${cardPackReward[1].toString()}`;
        this.nodeReward_CardPack.active = cardPackReward[1] > 0;

        // 更新卡牌包显示
        this.arrCardPack.forEach((node, index) => {
            node.active = index === cardPackReward[0] - 1;
        });

        // 延迟4秒
        await AsyncHelper.delayWithComponent(4, this);

        // 播放奖励动画1
        this.animCommon.play(this.ANIMATION_NAME_GEM_OPEN_REWARD_1, 0);
        
        // 1秒后播放奖励音效
        this.scheduleOnce(() => {
            SoundManager.Instance().playFxOnce(this._soundSetter.getAudioClip("POWERGEM_RESULT"), 0, 1);
        }, 1);

        // 隐藏开始按钮
        this.btnStart.node.active = false;

        // 更新金币奖励文本
        const coinReward = this._changeResult.key.getChangeCoinByPayCode(PayCode.PowerGemCoinReward);
        this.lblCoin.string = CurrencyFormatHelper.formatNumber(coinReward);

        // 延迟3秒
        await AsyncHelper.delayWithComponent(3, this);

        // 播放奖励动画2
        this.animCommon.play(this.ANIMATION_NAME_GEM_OPEN_REWARD_2, 0);
        this.nodeRewardDim.active = true;

        // 延迟1秒
        await AsyncHelper.delayWithComponent(1, this);

        // 显示收集按钮
        this.btnCollect.node.active = true;
        this.nodeTouchBG.active = false;
        this._isPlayCollectAction = true;
    }

    /**
     * 从服务器变更结果中提取JokerPoint奖励
     * @param changeResultKey 服务器变更结果Key
     */
    private getJokerPointByChangeResult(changeResultKey: any): number {
        if (!TSUtility.isValid(changeResultKey)) return 0;

        // 筛选JokerPoint奖励项
        const jokerPointItems = changeResultKey.itemHist.filter((item: any) => {
            return TSUtility.isValid(item) && 
                   item.itemId === SDefine.I_JOKER_CARD_POINT && 
                   item.addCnt > 0;
        });

        if (jokerPointItems.length <= 0) return 0;

        // 累加JokerPoint数量
        let totalJokerPoint = 0;
        jokerPointItems.forEach(item => {
            totalJokerPoint += item.addCnt;
        });

        return totalJokerPoint;
    }

    /**
     * 从服务器变更结果中提取卡牌包奖励
     * @param changeResultKey 服务器变更结果Key
     * @returns [卡牌包等级, 卡牌包数量]
     */
    private getCardPackCountByChangeResult(changeResultKey: any): [number, number] {
        if (!TSUtility.isValid(changeResultKey)) return [0, 0];

        // 筛选卡牌包奖励项
        const cardPackItems = changeResultKey.itemHist.filter((item: any) => {
            if (!TSUtility.isValid(item) || item.addCnt <= 0) return false;
            
            const cardPackItemIds = [
                SDefine.I_COLLECTION_CARD_PACK_1,
                SDefine.I_COLLECTION_CARD_PACK_2,
                SDefine.I_COLLECTION_CARD_PACK_3,
                SDefine.I_COLLECTION_CARD_PACK_4,
                SDefine.I_COLLECTION_CARD_PACK_5
            ];
            
            return cardPackItemIds.includes(item.itemId);
        });

        if (cardPackItems.length <= 0) return [0, 0];

        // 计算卡牌包总数和等级
        let totalCount = 0;
        let cardPackLevel = 0;

        cardPackItems.forEach(item => {
            totalCount += item.addCnt;
            
            // 确定卡牌包等级
            if (item.itemId === SDefine.I_COLLECTION_CARD_PACK_1) cardPackLevel = 1;
            else if (item.itemId === SDefine.I_COLLECTION_CARD_PACK_2) cardPackLevel = 2;
            else if (item.itemId === SDefine.I_COLLECTION_CARD_PACK_3) cardPackLevel = 3;
            else if (item.itemId === SDefine.I_COLLECTION_CARD_PACK_4) cardPackLevel = 4;
            else if (item.itemId === SDefine.I_COLLECTION_CARD_PACK_5) cardPackLevel = 5;
        });

        return [cardPackLevel, totalCount];
    }

    // ===================== 按钮点击事件 =====================
    /**
     * 开始按钮点击事件
     */
    private onClick_Start(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);

        // 请求服务器接受推广（开始宝石）
        CommonServer.Instance().requestAcceptPromotion(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            PowerGemPromotion.PromotionKeyName,
            1,
            this._numSlotIndex,
            "",
            (response) => {
                PopupManager.Instance().showDisplayProgress(false);
                
                if (!CommonServer.isServerResponseError(response)) {
                    // // 应用服务器变更结果
                    // const changeResult = UserInfo.instance().getServerChangeResult(response);
                    // UserInfo.instance().applyChangeResult(changeResult);
                    
                    // 刷新推广信息
                    PowerGemManager.instance.setRefreshPromotion(true);

                    // 清除动作信息
                    const actionPowerGemInfo = PowerGemManager.instance.getActionPowerGemInfo();
                    if (TSUtility.isValid(actionPowerGemInfo) && actionPowerGemInfo.getSlotIndex() === this._numSlotIndex) {
                        PowerGemManager.instance.setActionPowerGemInfo(null);
                    }

                    // 更新UI
                    this._setUI(PowerGemSlotOpenType.SLOT_START, this._numSlotIndex, true);
                }
            }
        );
    }

    /**
     * 打开按钮点击事件
     */
    private onClick_Open(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);

        // 请求服务器接受推广（打开宝石）
        CommonServer.Instance().requestAcceptPromotion(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            PowerGemPromotion.PromotionKeyName,
            2,
            this._numSlotIndex,
            "",
            (response) => {
                PopupManager.Instance().showDisplayProgress(false);
                
                if (!CommonServer.isServerResponseError(response)) {
                    // 保存变更结果
                    const changeResult = UserInfo.instance().getServerChangeResult(response);
                    PowerGemManager.instance.setChangeResult(this._numSlotIndex, changeResult);
                    
                    // 刷新推广信息
                    PowerGemManager.instance.setRefreshPromotion(true);

                    // 播放收集动画
                    this.playCollect();
                }
            }
        );
    }

    /**
     * 收集按钮点击事件
     */
    private onClick_Collect(): void {
        if (!TSUtility.isValid(this._changeResult)) return;

        PopupManager.Instance().showDisplayProgress(true);

        // 打开奖励弹窗
        CommonRewardPopup.getPopup((error, popup) => {
            PopupManager.Instance().showDisplayProgress(false);
            
            if (error === null) {
                // 打开奖励弹窗
                popup.open(
                    this._changeResult.key,
                    new CommonRewardTitleInfo({ title: CommonRewardTitleType.SCORE_GOT_ONE }),
                    CommonRewardButtonType.NONE,
                    null// new CommonRewardPopupInfo_PowerGem()
                );

                // 设置弹窗关闭回调
                popup.setCloseCallback(() => {
                    // 刷新卡牌包数量UI
                    if (UserInfo.instance().getCurrentSceneMode() === SDefine.Slot && TSUtility.isValid(HRVSlotService.instance().getInGameUI())) {
                        // HRVSlotService.instance().getInGameUI().starAlbumUI.refreshCardPackCntUI();
                    }

                    // 重置收集状态
                    this._isPlayCollectAction = false;

                    // 应用变更结果
                    UserInfo.instance().applyChangeResult(this._changeResult.key);
                    PowerGemManager.instance.setApplyChangeResultTime(this._changeResult.value);
                    PowerGemManager.instance.setChangeResult(this._numSlotIndex, null);
                    PowerGemManager.instance.setADSlotIndex(this._numSlotIndex, false);

                    // 清除动作信息
                    const actionPowerGemInfo = PowerGemManager.instance.getActionPowerGemInfo();
                    if (TSUtility.isValid(actionPowerGemInfo) && actionPowerGemInfo.getSlotIndex() === this._numSlotIndex) {
                        PowerGemManager.instance.setActionPowerGemInfo(null);
                    }

                    // 更新UI
                    this._setUI(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex, true);
                });
            }
        });
    }

    /**
     * 广告按钮点击事件
     */
    private onClick_AD(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);

        // 广告位置ID
        const placementId = PlacementID_Type.POWER_GEM;
        const adNumber = AdsManager.Instance().getRewardVideoADNumber(placementId);

        // 记录广告点击
        Analytics.clickADVideo(adNumber);

        // 播放奖励视频广告
        AdsManager.Instance().RewardedVideoAdplay(
            placementId,
            // 广告播放成功回调
            () => {
                // 设置AD Slot索引
                PowerGemManager.instance.setADSlotIndex(this._numSlotIndex, true);
                PopupManager.Instance().showDisplayProgress(true);

                // 请求服务器接受推广（广告奖励）
                CommonServer.Instance().requestAcceptPromotion(
                    UserInfo.instance().getUid(),
                    UserInfo.instance().getAccessToken(),
                    PowerGemPromotion.PromotionKeyName,
                    3,
                    this._numSlotIndex,
                    "",
                    (response) => {
                        PopupManager.Instance().showDisplayProgress(false);
                        
                        if (!CommonServer.isServerResponseError(response)) {
                            // 保存变更结果
                            const changeResult = UserInfo.instance().getServerChangeResult(response);
                            PowerGemManager.instance.setChangeResult(this._numSlotIndex, changeResult);
                            
                            // 刷新推广信息
                            PowerGemManager.instance.setRefreshPromotion(true);

                            // 播放收集动画
                            this.playCollect();
                        }
                    }
                );

                // 记录广告奖励
                AdsManager.Instance().ADLog_RewardedADRewarded(placementId);
            },
            // 广告播放失败回调
            () => {
                PopupManager.Instance().showDisplayProgress(false);
                this.btnAD.node.active = false;
                this._isFailedAD = true;
            }
        );
    }
}