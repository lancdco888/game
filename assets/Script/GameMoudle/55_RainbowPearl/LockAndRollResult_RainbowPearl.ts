import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import UserInfo from '../../User/UserInfo';
import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';
import ServicePopupManager from '../../manager/ServicePopupManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import { FBShareInfo } from '../../slot_common/SlotDataDefine';


const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl Lock&Roll模式奖金结果弹窗组件
 * 负责展示奖金金额、投注倍数，处理收集/分享逻辑、金币爆炸/收集特效、音效/音量控制、自动关闭等
 */
@ccclass('LockAndRollResult_RainbowPearl')
export default class LockAndRollResult_RainbowPearl extends cc.Component {
    //#region 组件引用
    /** 遮罩背景节点（阻止底层交互） */
    @property({ type: cc.Node })
    public blockingBG: cc.Node | null = null;

    /** 单注投注金额标签 */
    @property({ type: cc.Label })
    public lineBetLabel: cc.Label | null = null;

    /** 奖金金额标签 */
    @property({ type: cc.Label })
    public goldAmountLabel: cc.Label | null = null;

    /** 收集奖金按钮 */
    @property({ type: cc.Button })
    public collectButton: cc.Button | null = null;

    /** Facebook分享开关 */
    @property({ type: cc.Toggle })
    public shareToggle: cc.Toggle | null = null;

    /** 金币爆炸动画组件 */
    @property({ type: cc.Animation })
    public winExplodeCoin: cc.Animation | null = null;

    /** 金币收集特效节点 */
    @property({ type: cc.Node })
    public winCoinCollectFx: cc.Node | null = null;

    /** 弹窗动画组件 */
    @property({ type: cc.Animation })
    public anim: cc.Animation | null = null;

    /** 初始化时需要置0透明度的节点列表 */
    @property({ type: [cc.Node] })
    public initOpacityObjects: cc.Node[] = [];
    //#endregion

    //#region 私有状态
    /** 奖金金额 */
    private _goldAmount: number = 0;
    /** 弹窗关闭回调 */
    private _fnCallback: (() => void) | null = null;
    /** 是否自动关闭（倒计时触发） */
    private _isAutoClose: boolean = false;
    //#endregion

    onLoad(): void {
        // 获取Canvas节点并适配遮罩背景大小
        const canvasNode = cc.director.getScene()?.getComponentInChildren(cc.Canvas)?.node;
        if (this.blockingBG && canvasNode) {
            this.blockingBG.setContentSize(canvasNode.getContentSize());
        }

        // 为分享开关添加FB分享状态存储组件
        // if (this.shareToggle) {
        //     this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 打开Lock&Roll结果弹窗
     * @param goldAmount 奖金金额
     * @param lineBet 单注投注金额
     * @param callback 弹窗关闭回调
     */
    public open(goldAmount: number, lineBet: number, callback: (() => void) | null): void {
        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 播放Lock&Roll结果音效并获取音效时长
        const audioId = SlotSoundController.Instance().playAudio("LockAndRollResult", "FX");
        const audioDuration = audioId ? audioId.getDuration() : 0;

        // 播放弹窗动画
        this.anim?.play();

        // 初始化指定节点透明度为0
        this.initOpacityObjects.forEach(node => {
            node.opacity = 0;
        });

        // 激活弹窗节点，初始化特效/交互状态
        this.node.active = true;
        this.node.opacity = 255;
        this.blockingBG.active = true;
        this.winExplodeCoin?.node && (this.winExplodeCoin.node.active = false);
        this.winCoinCollectFx && (this.winCoinCollectFx.active = false);

        // 初始化状态变量
        this._isAutoClose = false;
        this._goldAmount = goldAmount;
        this._fnCallback = callback;

        // 激活所有粒子特效
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        particleSystems.forEach(particle => {
            particle.node.active = true;
        });

        // 控制分享开关显示（根据用户是否禁用FB分享）
        const isFBShareDisabled = false;//UserInfo.instance().isFBShareDisableTarget() === 0;
        this.shareToggle?.node && (this.shareToggle.node.active = isFBShareDisabled);

        // 计算奖金倍数并更新标签
        const multiple = Math.floor(goldAmount / lineBet);
        this.collectButton && (this.collectButton.interactable = true);
        this.goldAmountLabel && (this.goldAmountLabel.string = CurrencyFormatHelper.formatNumber(goldAmount));
        this.lineBetLabel && (this.lineBetLabel.string = CurrencyFormatHelper.formatNumber(multiple));

        // 延迟恢复少量主音量（音效播放中）
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 15秒后自动关闭弹窗
        this.scheduleOnce(() => {
            this._isAutoClose = true;
            this.onClickCollect();
        }, 15);
    }

    /**
     * 点击「收集奖金」按钮回调
     */
    public onClickCollect(): void {
        // 清空所有定时器
        this.unscheduleAllCallbacks();
        
        // 禁用收集按钮，停止Lock&Roll结果音效
        this.collectButton && (this.collectButton.interactable = false);
        SlotSoundController.Instance().stopAudio("LockAndRollResult", "FX");

        // 判断是否需要执行FB分享：未禁用分享 + 勾选分享 + 非自动关闭
        const isNeedShare = false//UserInfo.instance().isFBShareDisableTarget() === 0 
            // && this.shareToggle?.isChecked 
            // && !this._isAutoClose;

        if (isNeedShare) {
            // 执行FB分享，分享完成后播放金币爆炸特效
            // UserInfo.instance().facebookShare(this.getLockAndRollShareInfo(), () => {
            //     this.playExplodeCoinEffect();
            // });
        } else {
            // 直接播放金币爆炸特效
            this.playExplodeCoinEffect();
        }
    }

    /**
     * 播放金币爆炸+收集特效，完成奖金结算
     */
    private playExplodeCoinEffect(): void {
        if (!this.winCoinCollectFx || !this.winCoinCollectFx.parent) {
            this.endProcess();
            this._fnCallback && this._fnCallback();
            this.node.active = false;
            return;
        }

        // 计算金币收集特效目标位置（转换到UI节点本地坐标）
        const bigWinCoinTarget = SlotManager.Instance._inGameUI?.bigwinCoinTarget;
        if (!bigWinCoinTarget) {
            this.endProcess();
            this._fnCallback && this._fnCallback();
            this.node.active = false;
            return;
        }

        const worldPos = bigWinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent.convertToNodeSpaceAR(worldPos);
        this.winCoinCollectFx.setPosition(localPos);

        // 步骤1：播放金币爆炸动画，隐藏遮罩，停止粒子特效
        const playExplodeAni = cc.callFunc(() => {
            // 激活爆炸动画节点并播放
            this.winExplodeCoin?.node && (this.winExplodeCoin.node.active = true);
            this.blockingBG?.active && (this.blockingBG.active = false);
            this.winExplodeCoin?.stop();
            this.winExplodeCoin?.play();

            // 弹窗淡出，关闭所有粒子特效
            this.node.runAction(cc.fadeOut(0.3));
            const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
            particleSystems.forEach(particle => {
                particle.node.active = false;
            });

            // 播放金币爆炸音效
            SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");

            // 延迟播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 延迟激活收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx && (this.winCoinCollectFx.active = true);
            }, 1.35);

            // 延迟关闭收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx && (this.winCoinCollectFx.active = false);
            }, 2.3);
        });

        // 执行完整特效流程：爆炸→奖金结算→结束流程
        this.node.runAction(cc.sequence(
            playExplodeAni,
            cc.delayTime(1.8),
            // 结算奖金
            cc.callFunc(() => {
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._goldAmount);
            }),
            cc.delayTime(1.2),
            // 关闭弹窗，执行回调
            cc.callFunc(() => {
                this.node.active = false;
                this.endProcess();
                this._fnCallback && this._fnCallback();
            })
        ));
    }

    /**
     * 结束Lock&Roll结果流程（恢复状态、弹出新纪录提示）
     */
    private endProcess(): void {
        // 判断奖金类型，非免费旋转+普通胜利时弹出新纪录提示
        const winType = SlotGameResultManager.Instance.getWinType(this._goldAmount);
        if (!SlotReelSpinStateManager.Instance.getFreespinMode() && winType ===SlotGameResultManager.WINSTATE_NORMAL) {
            ServicePopupManager.instance().reserveNewRecordPopup(this._goldAmount);
        }

        // 恢复鼠标拖拽交互、重置主音量
        SlotManager.Instance.setMouseDragEventFlag(true);
        SoundManager.Instance().resetTemporarilyMainVolume();
    }

    /**
     * 构建Lock&Roll FB分享信息
     * @returns FBShareInfo 分享信息对象
     */
    private getLockAndRollShareInfo(): FBShareInfo {
        const shareInfo = new FBShareInfo();
        
        // 填充分享基础信息
        shareInfo.subInfo.puid = UserInfo.instance().getUid();
        shareInfo.subInfo.st = "Lock & Roll";
        shareInfo.subInfo.sl = "%s".format("");
        shareInfo.subInfo.ssl = UserInfo.instance().getGameId();
        shareInfo.subInfo.zid = UserInfo.instance().getZoneId();
        shareInfo.subInfo.img = SlotManager.Instance.lockandrollShareImgName;
        shareInfo.subInfo.tl = "Lock & Roll Baby!";
        
        // 填充分享描述
        shareInfo.desc = `Oh boy, what a win! 
            Come and get your fun wins now!`;

        return shareInfo;
    }
}