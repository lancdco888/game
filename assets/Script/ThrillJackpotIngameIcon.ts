// Cocos 2.x 标准头部解构写法 (指定要求)
const { ccclass, property } = cc._decorator;


import GameCommonSound from "./GameCommonSound";
import ServiceInfoManager from "./ServiceInfoManager";
import ThrillWheelJackpot from "./ThrillWheelJackpot";
import UserInfo, { MSG } from "./User/UserInfo";
import HeroTooltipPopup, { HT_MakingInfo } from "./Utility/HeroTooltipPopup";
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import SlotGameRuleManager from "./manager/SlotGameRuleManager";
import SlotManager from "./manager/SlotManager";
import SoundManager from "./manager/SoundManager";


/**
 * ThrillJackpot 游戏内图标组件
 * 负责 jackpot 图标显示、进度条更新、动画播放、交互逻辑等
 */
@ccclass()
export default class ThrillJackpotIngameIcon extends cc.Component {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Button, displayName: '交互按钮' })
    targetButton: cc.Button = null;

    @property({ type: cc.Animation, displayName: '主动画节点' })
    aniPivot: cc.Animation = null;

    @property({ type: cc.Node, displayName: '白银层级根节点' })
    rootSilver: cc.Node = null;

    @property({ type: cc.Node, displayName: '黄金层级根节点' })
    rootGold:cc. Node = null;

    @property({ type: cc.Node, displayName: '钻石层级根节点' })
    rootDiamond: cc.Node = null;

    @property({ type: cc.Sprite, displayName: '白银进度条' })
    sprGaugeSilver: cc.Sprite = null;

    @property({ type: cc.Sprite, displayName: '黄金进度条' })
    sprGaugeGold: cc.Sprite = null;

    @property({ type: cc.Sprite, displayName: '钻石进度条' })
    sprGaugeDiamond: cc.Sprite = null;

    @property({ type: [cc.Animation], displayName: '进度条增加动画列表' })
    listIncreaseGauge: cc.Animation[] = [];

    @property({ type: cc.Animation, displayName: '提示框动画' })
    aniTooltip: cc.Animation = null;

    @property({ type: cc.Node, displayName: '提示框根节点' })
    pivotTooltip: cc.Node = null;

    @property({ type: cc.Node, displayName: 'Jackpot提示框根节点' })
    pivotTooltipJackpot: cc.Node = null;

    @property({ type: [cc.Node], displayName: 'Jackpot提示文本列表' })
    listTooltipJackpotText: cc.Node[] = [];

    @property({ type: cc.Node, displayName: '升级提示文本' })
    tooltipCaptionUpgrade: cc.Node = null;

    @property({ type: [cc.Node], displayName: '降级提示文本列表' })
    listTooltipCaptionDowngrade: cc.Node[] = [];

    @property({ type: Number, displayName: '区域ID' })
    zoneID: number = 1;

    // === 私有状态属性 ===
    private _startTime: number = 0;
    private _duration: number = 0.2;
    private _startExp: number = 0;
    private _targetExp: number = 0;
    private _reEffect: number = 0;
    private _isPlayCollectAni: boolean = false;
    private _isOpen: boolean = false;
    private _isEnable: boolean = true;
    private _numPrevTotalBet: number = 0;
    private _isFirstLoad: boolean = true;

    onLoad() {
        const userInfoInst = UserInfo.instance();
        if (userInfoInst) {
            // 监听 jackpot 进度更新事件
            userInfoInst.addListenerTarget(MSG.UPDATE_THRILLWHEELGAUGE, this.refreshUI, this);
            // 绑定按钮点击事件
            this.targetButton.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ThrillJackpotIngameIcon", "onClickOpenButton", "")
            );
            // 监听金钱状态变化
            this.node.on("changeMoneyState", this.onChangeMoneyState.bind(this));
            // 添加游戏规则观察者
            SlotGameRuleManager.Instance.addObserver(this.node);
            // 播放闲置动画
            this.playIdleAni();
        }
    }

    onEnable() {
        this.init();
    }

    onDestroy() {
        const userInfoInst = UserInfo.instance();
        if (userInfoInst) {
            userInfoInst.removeListenerTargetAll(this);
        }
    }

    /**
     * 初始化组件
     */
    init() {
        this.setCurrentGauge(true);
    }

    /**
     * 金钱状态变化回调
     * 根据投注金额切换白银/黄金/钻石层级显示
     */
    onChangeMoneyState() {
        if (this.node.active === false) return;

        const currentBet = SlotGameRuleManager.Instance.getCurrentBetMoney();
        if (this._numPrevTotalBet !== currentBet) {
            this._numPrevTotalBet = currentBet;

            // 读取最小投注阈值
            const goldMinBet = ServiceInfoManager.NUMBER_THRILL_JACKPOT_GOLD_MIN_BET;
            const diamondMinBet = ServiceInfoManager.NUMBER_THRILL_JACKPOT_DIAMOND_MIN_BET;

            // 记录切换前的显示状态
            const prevSilverActive = this.rootSilver.active;
            const prevGoldActive = this.rootGold.active;
            const prevDiamondActive = this.rootDiamond.active;

            // 更新层级显示
            this.rootSilver.active = currentBet < goldMinBet;
            this.rootGold.active = currentBet >= goldMinBet && currentBet < diamondMinBet;
            this.rootDiamond.active = currentBet >= diamondMinBet;

            // 非首次加载时，状态变化则播放升级动画和提示
            if (!this._isFirstLoad) {
                const isStateSame = (
                    prevSilverActive === this.rootSilver.active &&
                    prevGoldActive === this.rootGold.active &&
                    prevDiamondActive === this.rootDiamond.active
                );
                if (!isStateSame) {
                    this.playUpgradeAni();
                    if (this.rootSilver.active) {
                        this.playTooltipAni(false, 0);
                    } else if (this.rootDiamond.active) {
                        this.playTooltipAni(true, 3);
                    } else if (prevSilverActive) {
                        this.playTooltipAni(true, 2);
                    } else {
                        this.playTooltipAni(false, 2);
                    }
                }
            } else {
                this._isFirstLoad = false;
            }
        }
    }

    /**
     * 刷新UI（进度条）
     * @param isInit 是否为初始化状态
     */
    refreshUI(isInit: boolean = true) {
        this.setCurrentGauge(isInit);
    }

    /**
     * 设置当前进度条显示
     * @param isInit 是否为初始化状态
     */
    setCurrentGauge(isInit: boolean = false) {
        let silverFill = 0;
        let goldFill = 0;
        let diamondFill = 0;

        // 获取各层级进度信息
        const silverGauge = UserInfo.instance().getThrillJackpotWheelGaugeInfo(0);
        const goldGauge = UserInfo.instance().getThrillJackpotWheelGaugeInfo(1);
        const diamondGauge = UserInfo.instance().getThrillJackpotWheelGaugeInfo(2);

        // 计算白银进度条填充比例
        if (silverGauge) {
            if (!isInit && silverGauge.curGauge === 0 && this.sprGaugeSilver.fillRange > 0) {
                silverFill = 1;
            } else if (silverGauge.curGauge > 0 && silverGauge.maxGauge > 0) {
                silverFill = silverGauge.curGauge / silverGauge.maxGauge;
            }
        }

        // 计算黄金进度条填充比例
        if (goldGauge) {
            if (!isInit && goldGauge.curGauge === 0 && this.sprGaugeGold.fillRange > 0) {
                goldFill = 1;
            } else if (goldGauge.curGauge > 0 && goldGauge.maxGauge > 0) {
                goldFill = goldGauge.curGauge / goldGauge.maxGauge;
            }
        }

        // 计算钻石进度条填充比例
        if (diamondGauge) {
            if (!isInit && diamondGauge.curGauge === 0 && this.sprGaugeDiamond.fillRange > 0) {
                diamondFill = 1;
            } else if (diamondGauge.curGauge > 0 && diamondGauge.maxGauge > 0) {
                diamondFill = diamondGauge.curGauge / diamondGauge.maxGauge;
            }
        }

        // 更新进度条显示
        if (this.sprGaugeSilver) this.sprGaugeSilver.fillRange = silverFill;
        if (this.sprGaugeGold) this.sprGaugeGold.fillRange = goldFill;
        if (this.sprGaugeDiamond) this.sprGaugeDiamond.fillRange = diamondFill;

        // 播放进度条增加动画
        this.playIncreaseGaugeAni();
    }

    /**
     * 播放进度条增加动画
     */
    playIncreaseGaugeAni() {
        this.listIncreaseGauge.forEach((ani) => {
            ani.stop();
            ani.play("Ingame_Icon_Gauge_Plus_Fx_Ani", 0);
        });
    }

    /**
     * 刷新提示框（检查是否需要显示ticket提示）
     */
    refreshTooltip() {
        const totalAmount = UserInfo.instance().getTripleDiamondWheelGoldAmount() + UserInfo.instance().getTripleDiamondWheelDiaAmount();
        const isTooltipTime = LocalStorageManager.getTDJTooltipTime() + 3600 <= TSUtility.getServerBaseNowUnixTime();

        if (totalAmount >= 15 && isTooltipTime) {
            this.asyncTooltip();
            LocalStorageManager.setTDJTooltipTime();
        }
    }

    /**
     * 异步显示提示框（替换原__awaiter/__generator语法）
     */
    async asyncTooltip() {
        try {
            // 获取提示框弹窗实例
            const popup = await HeroTooltipPopup.asyncGetPopup();
            
            // 校验实例有效性
            if (!TSUtility.isValid(this) || !TSUtility.isValid(popup) || !TSUtility.isValid(this.node)) {
                return;
            }

            // 配置并显示提示框
            popup.open(this.node);
            popup.setPivotPosition(this.node, -30, 0);
            popup.setInfoText(
                "<color=#FF00FF>MAXIMUM TICKET COUNT REACHED.</color>\n" +
                "<font='roboto_condensed'><color=#B6B6B6>PLEASE USE UP TICKETS TO\nMAKE ROOM FOR MORE.</color></font>"
            );

            // 提示框样式配置
            const tooltipConfig = {
                settingInfo: {
                    useBlockBG: false,
                    reserveCloseTime: 3
                },
                frameInfo: {
                    frameType: 1,
                    paddingWidth: 80,
                    paddingHeight: 68,
                    textOffsetX: 0,
                    textOffsetY: 0,
                    useArrow: true,
                    arrowPosType: 2,
                    arrowPosAnchor: 0.5,
                    arrowPosOffset: 30,
                    baseFontSize: 26,
                    fontLineHeight: 28
                },
                startAniInfo: [{
                    action: "move",
                    duration: 0.3,
                    easingType: "easeOut",
                    startOffsetX: -20,
                    startOffsetY: 0
                }, {
                    action: "fadeIn",
                    duration: 0.4
                }]
            };

            const makingInfo = HT_MakingInfo.parseObj(tooltipConfig);
            popup.setHero_HT_MakingInfo(makingInfo);
            popup.refreshUI();
        } catch (error) {
            console.error("Async tooltip error:", error);
        }
    }

    /**
     * 点击打开按钮回调
     */
    onClickOpenButton() {
        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        if (this._isOpen) return;

        // 暂存并禁用鼠标/键盘事件
        const prevMouseDragFlag = SlotManager.Instance.getMouseDragEventFlag();
        const prevKeyboardFlag = SlotManager.Instance.getKeyboardEventFlag();
        SlotManager.Instance.setMouseDragEventFlag(false);
        SlotManager.Instance.setKeyboardEventFlag(false);

        // 打开 jackpot 弹窗
        ThrillWheelJackpot.getPopup((isError: boolean, popup: any) => {
            if (isError) {
                // 出错时恢复事件状态
                SlotManager.Instance.setMouseDragEventFlag(prevMouseDragFlag);
                SlotManager.Instance.setKeyboardEventFlag(prevKeyboardFlag);
                return;
            }

            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            popup.open(null, totalBet);
            
            // 设置弹窗关闭回调
            popup.setCloseCallback(() => {
                this._isOpen = false;
                SlotManager.Instance.setMouseDragEventFlag(prevMouseDragFlag);
                SlotManager.Instance.setKeyboardEventFlag(prevKeyboardFlag);
            });
        });
    }

    /**
     * 播放闲置动画
     */
    playIdleAni() {
        if (this.aniPivot) {
            this.aniPivot.stop();
            this.aniPivot.play("Ingame_Icon_Idle_Ani", 0);
        }
    }

    /**
     * 播放升级动画
     */
    playUpgradeAni() {
        if (this.aniPivot) {
            this.aniPivot.stop();
            this.aniPivot.play("Ingame_Icon_Upgrade_Ani", 0);
        }
    }

    /**
     * 播放提示框动画
     * @param isUpgrade 是否为升级（true=升级，false=降级）
     * @param idx 提示文本索引
     */
    playTooltipAni(isUpgrade: boolean, idx: number) {
        this.unscheduleAllCallbacks();

        // 重置提示框状态
        if (this.aniTooltip) {
            this.aniTooltip.node.active = true;
            this.aniTooltip.node.scale = 1;
            this.aniTooltip.node.opacity = 255;
        }
        if (this.pivotTooltip) {
            this.pivotTooltip.scale = 0.5;
            this.pivotTooltip.opacity = 1;
        }
        if (this.pivotTooltipJackpot) {
            this.pivotTooltipJackpot.scale = 0.5;
            this.pivotTooltipJackpot.opacity = 1;
        }

        // 播放提示框打开动画
        if (this.aniTooltip) {
            this.aniTooltip.stop();
            this.aniTooltip.play("Ingame_Icon_Tooltip_Open_Ani", 0);
        }

        // 显示对应提示文本
        if (this.tooltipCaptionUpgrade) {
            this.tooltipCaptionUpgrade.active = isUpgrade;
        }
        // 隐藏所有 jackpot 提示文本，显示指定索引的
        this.listTooltipJackpotText.forEach((node) => node.active = false);
        if (this.listTooltipJackpotText[idx]) {
            this.listTooltipJackpotText[idx].active = true;
        }
        // 降级时显示对应降级文本
        this.listTooltipCaptionDowngrade.forEach((node) => node.active = false);
        if (!isUpgrade && this.listTooltipCaptionDowngrade[idx]) {
            this.listTooltipCaptionDowngrade[idx].active = true;
        }

        // 2秒后播放关闭动画
        this.scheduleOnce(() => {
            if (this.aniTooltip) {
                this.aniTooltip.stop();
                this.aniTooltip.play("Ingame_Icon_Tooltip_Close_Ani", 0);
            }
        }, 2);
    }

    /**
     * 播放进度条满值动画
     * @param callback 动画结束回调
     */
    playFullAni(callback: Function) {
        if (this.aniPivot) {
            this.aniPivot.stop();
            this.aniPivot.play("Ingame_Icon_Full_Ani", 0);
        }

        // 播放音效
        const soundSetter = this.node.getComponent(CommonSoundSetter);
        if (soundSetter) {
            SoundManager.Instance().playFxOnce(soundSetter.getAudioClip("thrill_wheel_icon_effect"));
        }

        // 1.5秒后执行回调
        this.scheduleOnce(() => {
            callback && callback();
        }, 1.5);
    }

    /**
     * 设置图标按钮交互状态
     * @param isInteractive 是否可交互
     */
    setInteractiveIconBtn(isInteractive: boolean) {
        if (TSUtility.isValid(this.targetButton)) {
            this.targetButton.interactable = isInteractive;
        }
    }
}