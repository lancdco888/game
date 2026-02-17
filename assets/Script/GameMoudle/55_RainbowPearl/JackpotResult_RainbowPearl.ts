import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import UserInfo from '../../User/UserInfo';
import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';
import ServicePopupManager from '../../manager/ServicePopupManager';
import SlotManager from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import { FBShareInfo } from '../../slot_common/SlotDataDefine';

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl Jackpot奖金结果弹窗组件
 * 负责展示Jackpot奖金金额、投注倍数，处理收集/分享逻辑、音效/音量控制、自动关闭等
 */
@ccclass('JackpotResult_RainbowPearl')
export default class JackpotResult_RainbowPearl extends cc.Component {
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

    /** 弹窗动画组件 */
    @property({ type: cc.Animation })
    public anim: cc.Animation | null = null;
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

        // // 为分享开关添加FB分享状态存储组件
        // if (this.shareToggle) {
        //     this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 打开Jackpot结果弹窗
     * @param goldAmount 奖金金额
     * @param lineBet 单注投注金额
     * @param callback 弹窗关闭回调
     */
    public open(goldAmount: number, lineBet: number, callback: (() => void) | null): void {
        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 播放Jackpot结果音效并获取音效时长
        const audioId = SlotSoundController.Instance().playAudio("JackpotResult", "FX");
        const audioDuration = audioId ? audioId.getDuration() : 0;

        // 播放弹窗动画，激活节点
        this.anim?.play();
        this.node.active = true;
        this.node.opacity = 255;
        this.blockingBG.active = true;

        // 初始化状态
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
        
        // 禁用收集按钮，停止Jackpot结果音效
        this.collectButton && (this.collectButton.interactable = false);
        SlotSoundController.Instance().stopAudio("JackpotResult", "FX");

        // 判断是否需要执行FB分享：未禁用分享 + 勾选分享 + 非自动关闭
        const isNeedShare = //UserInfo.instance().isFBShareDisableTarget() === 0 
            this.shareToggle?.isChecked 
            && !this._isAutoClose;

        if (isNeedShare) {
            // 执行FB分享，分享完成后结束流程
            // UserInfo.instance().facebookShare(this.getJackpotShareInfo(), () => {
            //     this.endProcess();
            // });
        } else {
            // 直接结束流程
            this.endProcess();
        }
    }

    /**
     * 构建Jackpot FB分享信息
     * @returns FBShareInfo 分享信息对象
     */
    private getJackpotShareInfo(): FBShareInfo {
        const shareInfo = new FBShareInfo();
        
        // 填充分享基础信息
        shareInfo.subInfo.puid = UserInfo.instance().getUid();
        shareInfo.subInfo.st = "Jackpot";
        shareInfo.subInfo.sl = "%s".format("")//UserInfo.instance().getLocation());
        shareInfo.subInfo.ssl = UserInfo.instance().getGameId();
        shareInfo.subInfo.zid = UserInfo.instance().getZoneId();
        shareInfo.subInfo.img = SlotManager.Instance.jackpotCommonShareImgName;
        shareInfo.subInfo.tl = "I can not believe it!";
        
        // 填充分享描述（包含格式化的奖金金额）
        shareInfo.desc = `Incredible! 
            I struck a MONSTROUS JACKPOT of ${CurrencyFormatHelper.formatNumber(this._goldAmount)} coins! 
            Tap now and test your luck!`;

        return shareInfo;
    }

    /**
     * 结束Jackpot结果流程（关闭弹窗、恢复状态）
     */
    private endProcess(): void {
        // 非免费旋转模式时，弹出新纪录提示
        if (!SlotReelSpinStateManager.Instance.getFreespinMode()) {
            ServicePopupManager.instance().reserveNewRecordPopup(this._goldAmount);
        }

        // 恢复鼠标拖拽交互、重置主音量
        SlotManager.Instance.setMouseDragEventFlag(true);
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行关闭回调，隐藏弹窗
        this._fnCallback && this._fnCallback();
        this.node.active = false;
    }
}