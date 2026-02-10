import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import SlotSoundController from "../../Slot/SlotSoundController";
import UserInfo from "../../User/UserInfo";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";
import ServicePopupManager from "../../manager/ServicePopupManager";
import SlotGameResultManager, { SpinResult } from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;



/**
 * 龙珠游戏免费旋转结果弹窗组件
 * 管理弹窗显隐、奖励显示、分享控制、收集按钮交互、金币特效播放、游戏结果结算等核心逻辑
 */
@ccclass('FreeSpinResultPopup_DragonOrbs')
export default class FreeSpinResultPopup_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 遮罩背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    /** 收集按钮 */
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    /** 分享切换开关 */
    @property(cc.Toggle)
    public shareToggle: cc.Toggle | null = null;

    /** 分享区域根节点 */
    @property(cc.Node)
    public shareRoot: cc.Node | null = null;

    /** 短文本奖励显示根节点（金额<10亿） */
    @property(cc.Node)
    public shortRoot: cc.Node | null = null;

    /** 长文本奖励显示根节点（金额≥10亿） */
    @property(cc.Node)
    public longRoot: cc.Node | null = null;

    /** 短文本奖励标签 */
    @property(cc.Label)
    public rewardLabel_Short: cc.Label | null = null;

    /** 长文本奖励标签 */
    @property(cc.Label)
    public rewardLabel_Long: cc.Label | null = null;

    /** 旋转次数标签 */
    @property(cc.Label)
    public spinCnt: cc.Label | null = null;

    /** 每线投注倍数标签 */
    @property(cc.Label)
    public lineBetLabel: cc.Label | null = null;

    /** 需要初始化透明度的节点列表 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 弹窗根节点 */
    @property(cc.Node)
    public root: cc.Node | null = null;

    /** 金币爆炸动画组件 */
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation | null = null;

    /** 金币收集特效节点 */
    @property(cc.Node)
    public winCoinCollectFx: cc.Node | null = null;

    // ===================== 私有状态（与原JS一致） =====================
    /** 奖励金币金额 */
    private _goldAmount: number = 0;

    /** 弹窗关闭回调函数 */
    private _fnCallback: (() => void) | null = null;

    /** 是否自动关闭 */
    private _isAutoClose: boolean = false;

    // ===================== 生命周期/核心方法（与原JS逻辑1:1） =====================
    /**
     * 组件加载时初始化遮罩背景尺寸+添加分享存储组件
     */
    public onLoad(): void {
        // 获取场景中的Canvas组件
        const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!TSUtility.isValid(canvasComp)) return;

        // 设置遮罩背景尺寸
        const canvasSize = canvasComp.node.getContentSize();
        this.blockingBG!.setContentSize(canvasSize.width, canvasSize.height + 200);

        // // 为分享切换开关添加FB分享存储组件
        // if (TSUtility.isValid(this.shareToggle)) {
        //     this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 打开结果弹窗（初始化状态+显示奖励+播放动画/音效）
     * @param goldAmount 奖励金币金额
     * @param spinCount 旋转次数
     * @param lineBet 每线投注额
     * @param callback 弹窗关闭后的回调
     */
    public open(
        goldAmount: number,
        spinCount: number,
        lineBet: number,
        callback: (() => void) | null
    ): void {
        const self = this;

        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 播放结果弹窗音效并获取时长
        const audioClip = SlotSoundController.Instance().playAudio("FreeSpinResultPopup", "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;

        // 初始化弹窗状态
        this.root!.scale = 1;
        this.node.active = true;
        this.root!.active = false;
        this.blockingBG!.active = true;
        this.blockingBG!.opacity = 0;
        this._isAutoClose = false;
        this._goldAmount = goldAmount;
        this._fnCallback = callback;

        // 激活根节点并重置动画
        this.root!.active = true;
        const rootAni = this.root!.getComponent(cc.Animation);
        if (TSUtility.isValid(rootAni)) {
            rootAni.stop();
            rootAni.play();
        }

        // 停止收集按钮动画
        const collectBtnPivotAni = this.collectButton!.node.getChildByName("Pivot")?.getComponent(cc.Animation);
        if (TSUtility.isValid(collectBtnPivotAni)) {
            collectBtnPivotAni.stop();
        }

        // 初始化透明节点为0透明度
        for (let i = 0; i < this.nodesInitOpacity.length; ++i) {
            this.nodesInitOpacity[i].opacity = 0;
        }

        // 激活所有粒子系统
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        for (let i = 0; i < particleSystems.length; ++i) {
            particleSystems[i].node.active = true;
        }

        // 控制分享区域显隐（判断是否禁用FB分享）
        this.shareRoot!.active = false;//UserInfo.instance().isFBShareDisableTarget() === 0;

        // 计算每线倍数并选择奖励标签（短/长文本）
        const lineBetMultiple = Math.floor(goldAmount / lineBet);
        this.collectButton!.interactable = false;
        let rewardLabel: cc.Label | null = null;

        if (this._goldAmount > 999999999) {
            this.longRoot!.active = true;
            this.shortRoot!.active = false;
            rewardLabel = this.rewardLabel_Long;
        } else {
            this.longRoot!.active = false;
            this.shortRoot!.active = true;
            rewardLabel = this.rewardLabel_Short;
        }

        // 1.1秒后激活分享切换开关
        this.shareToggle!.interactable = false;
        this.scheduleOnce(() => {
            self.shareToggle!.interactable = true;
        }, 1.1);

        // 更新旋转次数标签
        this.spinCnt!.string = spinCount.toString();

        // 播放数字变化动画（2秒从0到奖励金额）
        if (TSUtility.isValid(rewardLabel)) {
            const changeNumComp = rewardLabel.getComponent(ChangeNumberComponent);
            if (TSUtility.isValid(changeNumComp)) {
                changeNumComp.playChangeNumber(
                    0,
                    this._goldAmount,
                    () => {
                        // 数字动画完成后激活收集按钮+播放按钮动画+绑定点击事件
                        self.collectButton!.interactable = true;
                        if (TSUtility.isValid(collectBtnPivotAni)) {
                            collectBtnPivotAni.play();
                        }
                        self.collectButton!.clickEvents.push(
                            Utility.getComponent_EventHandler(
                                self.node,
                                "FreeSpinResultPopup_DragonOrbs",
                                "onClickCollect",
                                ""
                            )
                        );
                    },
                    2
                );
            }
        }

        // 更新每线投注倍数标签
        this.lineBetLabel!.string = "x" + CurrencyFormatHelper.formatNumber(lineBetMultiple);

        // 音频播放完成后恢复低音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 15秒后自动关闭
        this.scheduleOnce(() => {
            self._isAutoClose = true;
            self.onClickCollect();
        }, 15);
    }

    /**
     * 点击收集按钮（处理分享判断+播放金币特效）
     */
    public onClickCollect(): void {
        const self = this;

        // 清空收集按钮事件+取消所有定时器
        this.collectButton!.clickEvents = [];
        this.unscheduleAllCallbacks();
        this.collectButton!.interactable = false;

        // 停止结果弹窗音效
        SlotSoundController.Instance().stopAudio("FreeSpinResultPopup", "FX");

        // 判断是否分享：未禁用FB+勾选分享+非自动关闭 → 执行FB分享，否则直接播放特效
        const isShareEnabled = false;//UserInfo.instance().isFBShareDisableTarget() === 0;
        const isShareChecked = this.shareToggle!.getComponent(cc.Toggle)!.isChecked;
        if (isShareEnabled && isShareChecked && !this._isAutoClose) {
            // UserInfo.instance().facebookShare(
            //     GameResultPopup.getFreespinShareInfo(this._goldAmount),
            //     () => {
            //         self.playExplodeCoinEffect();
            //     }
            // );
        } else {
            self.playExplodeCoinEffect();
        }
    }

    /**
     * 播放金币爆炸+收集特效（计算位置+执行动作序列+结算游戏结果）
     */
    public playExplodeCoinEffect(): void {
        const self = this;

        // 计算金币收集特效目标位置（世界坐标转本地坐标）
        const targetWorldPos = SlotManager.Instance._inGameUI.bigwinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const targetLocalPos = this.winCoinCollectFx!.parent!.convertToNodeSpaceAR(targetWorldPos);
        this.winCoinCollectFx!.setPosition(targetLocalPos);
        this.root!.scale = 0;

        // 构建特效播放回调
        const playFxCallback = cc.callFunc(() => {
            // 播放金币爆炸动画
            this.winExplodeCoin!.node.active = true;
            this.blockingBG!.active = false;
            this.winExplodeCoin!.stop();
            this.winExplodeCoin!.play();

            // 播放特效音效
            SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");

            // 1.1秒后播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 1.35秒后激活收集特效
            this.scheduleOnce(() => {
                self.winCoinCollectFx!.active = true;
            }, 1.35);

            // 2.3秒后关闭收集特效
            this.scheduleOnce(() => {
                self.winCoinCollectFx!.active = false;
            }, 2.3);
        });

        // 执行动作序列：播放特效 → 延迟 → 结算游戏结果 → 延迟 → 结束流程
        this.node.runAction(cc.sequence(
            playFxCallback,
            cc.delayTime(1.8),
            cc.callFunc(() => {
                // 结算游戏结果（扣除Jackpot奖励）
                const spinResult: SpinResult = SlotGameResultManager.Instance.getSpinResult();
                let totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
                
                if (spinResult.jackpotResults.length > 0) {
                    totalWinMoney -= spinResult.jackpotResults[0].winningCoin;
                }
                
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(totalWinMoney);
            }),
            cc.delayTime(1.2),
            cc.callFunc(() => {
                self.endProcess();
            })
        ));
    }

    /**
     * 结束弹窗流程（保留新记录弹窗+隐藏节点+恢复音量+触发回调）
     */
    public endProcess(): void {
        // 判断是否为普通胜利，若是则预约新记录弹窗
        const winType = SlotGameResultManager.Instance.getWinType(SlotGameResultManager.Instance.winMoneyInFreespinMode);
        if (winType === SlotGameResultManager.WINSTATE_NORMAL) {
            ServicePopupManager.instance().reserveNewRecordPopup(this._goldAmount);
        }

        // 隐藏节点+恢复主音量
        this.node.active = false;
        this.blockingBG!.active = false;
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 触发关闭回调
        if (this._fnCallback) {
            this._fnCallback();
        }
    }
}