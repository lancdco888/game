import SlotSoundController from "../../Slot/SlotSoundController";
import UserInfo from "../../User/UserInfo";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import { FBShareInfo } from "../../slot_common/SlotDataDefine";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts Jackpot结果弹窗组件
 */
@ccclass()
export default class JackpotResultPopup_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 弹窗根节点 */
    @property(cc.Node)
    public root: cc.Node = null;

    /** 遮挡背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    /** 装饰节点 */
    @property(cc.Node)
    public deco_Node: cc.Node = null;

    /** 弹窗启动动画 */
    @property(cc.Animation)
    public startAni: cc.Animation = null;

    /** Jackpot次数标签 */
    @property(cc.Label)
    public jackpotCountLabel: cc.Label = null;

    /** 长背景（金额≥10亿时显示） */
    @property(cc.Node)
    public long_BG: cc.Node = null;

    /** 短背景（金额<10亿时显示） */
    @property(cc.Node)
    public short_BG: cc.Node = null;

    /** 奖金金额标签数组 */
    @property([cc.Label])
    public resultMoneys: cc.Label[] = [];

    /** 收集按钮 */
    @property(cc.Button)
    public collectButton: cc.Button = null;

    /** 分享开关 */
    @property(cc.Toggle)
    public toggleShare: cc.Toggle = null;

    /** 分享组件根节点 */
    @property(cc.Node)
    public rootShareComponent: cc.Node = null;

    /** 需要初始化缩放的节点数组 */
    @property([cc.Node])
    public nodesInitScale: cc.Node[] = [];

    /** 需要初始化透明度的节点数组 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 金币爆炸动画 */
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation = null;

    /** 金币收集特效节点 */
    @property(cc.Node)
    public winCoinCollectFx: cc.Node = null;

    // ========== 私有状态属性 ==========
    /** 弹窗结束回调 */
    private _callback: (() => void) | null = null;

    /** 中奖金币数 */
    private _winningCoin: number = 0;

    /** Jackpot类型 */
    private _jackpotType: number = 0;

    /** 是否自动关闭 */
    private _autoClose: boolean = false;

    /** 是否已点击收集按钮 */
    private _isClicked: boolean = false;

    /**
     * 组件加载时初始化
     */
    public onLoad(): void {
        // 获取画布组件，设置遮挡背景和装饰节点尺寸
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (TSUtility.isValid(canvas)) {
            const canvasSize = canvas.node.getContentSize();
            const width = canvasSize.width + 5;
            const height = canvasSize.height + 5;

            if (TSUtility.isValid(this.blockingBG)) {
                this.blockingBG.setContentSize(width, height);
            }
            if (TSUtility.isValid(this.deco_Node)) {
                this.deco_Node.setContentSize(width, height);
            }
        }

        // 为分享开关添加FB分享存储组件
        // if (isValid(this.toggleShare)) {
        //     if (!this.toggleShare.getComponent(FBShareFlagToStorageInGame)) {
        //         this.toggleShare.addComponent(FBShareFlagToStorageInGame);
        //     }
        // }
    }

    /**
     * 初始化弹窗基础状态
     */
    public init(): void {
        // 初始化根节点状态
        if (TSUtility.isValid(this.root)) {
            this.root.opacity = 255;
            this.root.scale = 1;
        }

        // 隐藏金币爆炸特效
        if (TSUtility.isValid(this.winExplodeCoin)) {
            this.winExplodeCoin.node.active = false;
        }

        // 显示遮挡背景，禁用收集按钮
        if (TSUtility.isValid(this.blockingBG)) {
            this.blockingBG.active = true;
        }
        if (TSUtility.isValid(this.collectButton)) {
            this.collectButton.interactable = false;
        }

        // 默认自动关闭
        this._autoClose = true;

        // 初始化子节点透明度（置0）
        this.nodesInitOpacity.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.opacity = 0;
            }
        });

        // 初始化子节点缩放（置0）
        this.nodesInitScale.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.scale = 0;
            }
        });

        // 显示弹窗
        this.node.active = true;
    }

    /**
     * 显示Jackpot结果弹窗
     * @param winningCoin 中奖金币数
     * @param jackpotType Jackpot类型
     * @param callback 弹窗结束回调
     */
    public showPopup(winningCoin: number, jackpotType: number, callback?: () => void): void {
        // 初始化弹窗
        this.init();

        // 保存核心参数
        this._winningCoin = winningCoin;
        this._jackpotType = jackpotType;
        this._autoClose = false;
        this._callback = callback || null;

        // 播放启动动画
        if (TSUtility.isValid(this.startAni)) {
            this.startAni.stop();
            this.startAni.setCurrentTime(0);
            this.startAni.play();
        }

        // 播放音效（空音效占位，保留原逻辑）
        SlotSoundController.Instance().playAudio("", "FX");

        // 设置Jackpot次数标签
        if (TSUtility.isValid(this.jackpotCountLabel)) {
            this.jackpotCountLabel.string = jackpotType.toString();
        }

        // 根据金额大小切换背景
        if (TSUtility.isValid(this.long_BG) && TSUtility.isValid(this.short_BG)) {
            if (winningCoin < 1e9) {
                this.long_BG.active = false;
                this.short_BG.active = true;
            } else {
                this.long_BG.active = true;
                this.short_BG.active = false;
            }
        }

        // 格式化并设置奖金金额标签
        const formattedCoin = CurrencyFormatHelper.formatNumber(winningCoin);
        this.resultMoneys.forEach(label => {
            if (TSUtility.isValid(label)) {
                label.string = formattedCoin;
            }
        });

        // 处理分享组件显示逻辑
        if (TSUtility.isValid(this.toggleShare) && TSUtility.isValid(this.rootShareComponent)) {
            // // 确保分享开关绑定了FB分享组件
            // if (!this.toggleShare.getComponent(FBShareFlagToStorageInGame)) {
            //     this.toggleShare.addComponent(FBShareFlagToStorageInGame);
            // }

            // 根据用户设置显示/隐藏分享组件
            if (UserInfo.instance().isFBShareDisableTarget()) {
                this.rootShareComponent.active = false;
            } else {
                this.rootShareComponent.active = true;
            }
        }

        // 播放Jackpot音效并处理音量
        const audioClip = SlotSoundController.Instance().playAudio("JackpotResultPopup", "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 启用收集按钮，重置点击状态
        if (TSUtility.isValid(this.collectButton)) {
            this.collectButton.interactable = true;
        }
        this._isClicked = false;

        // 音效播放中降低主音量，音效结束后恢复部分音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 15秒后自动关闭
        this.scheduleOnce(() => {
            this._autoClose = true;
            this.onClickCollect();
        }, 15);
    }

    /**
     * 点击收集按钮的核心逻辑
     */
    public onClickCollect(): void {
        // 已点击则直接返回
        if (this._isClicked) return;

        // 取消所有定时器
        this.unscheduleAllCallbacks();
        this._isClicked = true;

        // 禁用收集按钮，停止Jackpot音效
        if (TSUtility.isValid(this.collectButton)) {
            this.collectButton.interactable = false;
        }
        SlotSoundController.Instance().stopAudio("JackpotResultPopup", "FX");

        // 处理分享逻辑：未禁用FB分享 + 勾选分享 + 非自动关闭 → 执行分享；否则直接播放特效
        const userInfo = UserInfo.instance();
        // if (userInfo.isFBShareDisableTarget() === 0 && TSUtility.isValid(this.toggleShare) && this.toggleShare.isChecked && !this._autoClose) {
        //     userInfo.facebookShare(this.getJackpotShareInfo(), () => {
        //         this.playExplodeCoinEffect();
        //     });
        // } else {
            this.playExplodeCoinEffect();
        // }
    }

    /**
     * 播放金币爆炸与收集特效
     */
    public playExplodeCoinEffect(): void {
        // 坐标转换：将大赢金币目标节点的世界坐标转为收集特效节点的本地坐标
        const bigwinCoinTarget = SlotManager.Instance._inGameUI.bigwinCoinTarget;
        if (!TSUtility.isValid(bigwinCoinTarget) || !TSUtility.isValid(this.winCoinCollectFx)) return;

        const worldPos = bigwinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent.convertToNodeSpace(new cc.Vec2(worldPos.x, worldPos.y));
        this.winCoinCollectFx.setPosition(localPos);

        // 构建特效播放动作序列
        const explodeAction = cc.callFunc(() => {
            // 显示并播放金币爆炸动画
            if (TSUtility.isValid(this.winExplodeCoin)) {
                this.winExplodeCoin.node.active = true;
                this.winExplodeCoin.stop();
                this.winExplodeCoin.play();
            }

            // 隐藏弹窗根节点
            if (TSUtility.isValid(this.root)) {
                this.root.opacity = 0;
            }

            // 播放金币爆炸音效
            SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");

            // 1.1秒后播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 1.35秒后显示收集特效
            this.scheduleOnce(() => {
                if (TSUtility.isValid(this.winCoinCollectFx)) {
                    this.winCoinCollectFx.active = true;
                }
            }, 1.35);

            // 2.3秒后隐藏收集特效
            this.scheduleOnce(() => {
                if (TSUtility.isValid(this.winCoinCollectFx)) {
                    this.winCoinCollectFx.active = false;
                }
            }, 2.3);
        });

        // 执行完整动作序列：播放爆炸特效 → 延迟 → 应用奖金 → 延迟 → 结束弹窗
        this.node.runAction(cc.sequence(
            explodeAction,
            cc.delayTime(1.8),
            cc.callFunc(() => {
                // 应用中奖金币到游戏结果
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._winningCoin);
            }),
            cc.delayTime(1.2),
            cc.callFunc(() => {
                // 处理弹窗结束逻辑
                this.processEnd();
            })
        ));
    }

    /**
     * 构建Facebook分享信息
     * @returns FBShareInfo 分享信息对象
     */
    public getJackpotShareInfo(): any {
        const shareInfo = new FBShareInfo();
        
        // 填充分享基础信息
        shareInfo.subInfo.puid = UserInfo.instance().getUid();
        shareInfo.subInfo.st = "Jackpot";
        // shareInfo.subInfo.sl = "%s".format(UserInfo.instance().getLocation());
        shareInfo.subInfo.ssl = UserInfo.instance().getGameId();
        shareInfo.subInfo.zid = UserInfo.instance().getZoneId();
        shareInfo.subInfo.img = "slot-supersevenblasts-jackpot-20240207.jpg";
        shareInfo.subInfo.tl = "I can not believe it!";
        
        // 格式化分享描述（包含中奖金额）
        const formattedCoin = CurrencyFormatHelper.formatNumber(this._winningCoin);
        shareInfo.desc = `Incredible! 
        I struck a MONSTROUS JACKPOT of ${formattedCoin} coins! 
        Tap now and test your luck!`;

        return shareInfo;
    }

    /**
     * 处理弹窗结束逻辑
     */
    public processEnd(): void {
        // 取消所有定时器
        this.unscheduleAllCallbacks();

        // 隐藏弹窗
        this.node.active = false;

        // 恢复主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行结束回调
        if (this._callback && typeof this._callback === 'function') {
            this._callback();
        }
    }
}