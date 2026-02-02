import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势 Lock&Roll 结果弹窗组件
 * 负责展示奖金结果、处理领取交互、播放金币爆炸特效、支持Facebook分享
 */
@ccclass("LockNRollResultPopup_Zhuquefortune")
export default class LockNRollResultPopup_Zhuquefortune extends cc.Component {
    // 弹窗根节点
    @property(cc.Node)
    public root: cc.Node | null = null;

    // 遮罩背景（阻止底层交互）
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    // 装饰节点（适配画布大小）
    @property(cc.Node)
    public deco_Node: cc.Node | null = null;

    // 弹窗启动动画组件
    @property(cc.Animation)
    public startAni: cc.Animation | null = null;

    // 奖金金额标签（显示最终获胜金币）
    @property(cc.Label)
    public resultMoney: cc.Label | null = null;

    // 线注倍数标签（显示 Xxx 倍数）
    @property(cc.Label)
    public lineBetLabel: cc.Label | null = null;

    // 领取按钮
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    // 分享切换开关（是否勾选分享）
    @property(cc.Toggle)
    public toggleShare: cc.Toggle | null = null;

    // 分享组件根节点
    @property(cc.Node)
    public rootShareComponent: cc.Node | null = null;

    // 初始化时需要隐藏的节点数组
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    // 初始化时需要透明的节点数组
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // 金币爆炸动画组件
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation | null = null;

    // 金币收集特效节点
    @property(cc.Node)
    public winCoinCollectFx: cc.Node | null = null;

    // 大额奖金背景（≥10亿）
    @property(cc.Node)
    public long_BG: cc.Node | null = null;

    // 小额奖金背景（<10亿）
    @property(cc.Node)
    public short_BG: cc.Node | null = null;

    // 顶层遮罩节点（防止领取后重复交互）
    @property(cc.Node)
    public topBlockNode: cc.Node | null = null;

    // 私有变量：回调函数（弹窗结束后执行）
    private _callback: (() => void) | null = null;

    // 私有变量：获胜金币金额
    private _winningCoin: number = 0;

    // 私有变量：是否自动关闭（自动旋转模式下）
    private _autoClose: boolean = false;

    // 私有变量：是否已点击领取（防止重复点击）
    private _isClicked: boolean = false;

    // 私有变量：弹窗音效名称（保留原代码拼写 soudn → sound，避免影响音效调用）
    private _soudnName: string = "LockNRollResultPopup";

    /**
     * 组件加载时执行（初始化节点大小、添加分享组件）
     */
    public onLoad(): void {
        // 获取场景中的 Canvas 组件，用于适配节点大小
        const canvasComponent = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (!canvasComponent || !canvasComponent.node) return;

        const canvasSize = canvasComponent.node.getContentSize();

        // 适配遮罩、装饰、顶层遮罩的大小
        if (this.blockingBG) {
            this.blockingBG.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
        if (this.deco_Node) {
            this.deco_Node.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
        if (this.topBlockNode) {
            this.topBlockNode.setContentSize(canvasSize.width, canvasSize.height);
        }

        // // 为分享开关添加 FB 分享存储组件
        // if (this.toggleShare && this.toggleShare.node) {
        //     this.toggleShare.node.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 初始化弹窗状态（重置所有节点、隐藏分享组件（如需）、关闭底层交互）
     */
    public init(): void {
        // 重置根节点透明度
        if (this.root) {
            this.root.opacity = 255;
        }

        // 显示遮罩、启用领取按钮、隐藏金币爆炸特效
        if (this.blockingBG) {
            this.blockingBG.active = true;
        }
        if (this.collectButton) {
            this.collectButton.interactable = true;
        }
        if (this.winExplodeCoin && this.winExplodeCoin.node) {
            this.winExplodeCoin.node.active = false;
        }

        // 重置私有状态变量
        this._autoClose = false;
        this._isClicked = false;

        // 初始化节点透明度（设为0）
        for (let i = 0; i < this.nodesInitOpacity.length; ++i) {
            const node = this.nodesInitOpacity[i];
            if (node) {
                node.opacity = 0;
            }
        }

        // 初始化节点激活状态（设为false）
        for (let i = 0; i < this.nodesInitActive.length; ++i) {
            const node = this.nodesInitActive[i];
            if (node) {
                node.active = false;
            }
        }

        // 判断是否禁用 Facebook 分享，控制分享组件显隐
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget();
        if (this.rootShareComponent) {
            this.rootShareComponent.active = (isFBShareDisabled !== 1);
        }

        // 处理子游戏Key（兼容 tori_game 特殊逻辑）
        let currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        if (currentSubGameKey === "tori_game") {
            const toriGameState = SlotGameResultManager.Instance.getSubGameState("tori_game");
            currentSubGameKey = toriGameState.prevSubGameKey;
        }

        // 显示弹窗、隐藏顶层遮罩、关闭鼠标拖拽交互、静音主音量
        this.node.active = true;
        if (this.topBlockNode) {
            this.topBlockNode.active = false;
        }
        SlotManager.Instance.setMouseDragEventFlag(false);
        SoundManager.Instance().setMainVolumeTemporarily(0);
    }

    /**
     * 打开弹窗（展示奖金、播放启动动画、处理自动关闭逻辑）
     * @param winningCoin 获胜金币金额
     * @param lineBet 线注金额
     * @param callback 弹窗结束后的回调函数
     */
    public open(winningCoin: number, lineBet: number, callback?: () => void): void {
        this.init();

        // 计算线注倍数并更新标签
        const lineBetMultiple = Math.floor(winningCoin / lineBet);
        if (this.lineBetLabel) {
            this.lineBetLabel.string = "X" + CurrencyFormatHelper.formatNumber(lineBetMultiple);
        }

        // 播放启动动画（重置到起始帧）
        if (this.startAni) {
            this.startAni.stop();
            this.startAni.setCurrentTime(0);
            this.startAni.play();
        }

        // 保存获胜金币和回调函数
        this._winningCoin = winningCoin;
        this._callback = callback;

        // 切换奖金背景（大额≥10亿，小额<10亿）
        if (this.long_BG && this.short_BG) {
            this.long_BG.active = (winningCoin >= 1e9);
            this.short_BG.active = (winningCoin < 1e9);
        }

        // 播放数字变化动画（从0到获胜金币，时长1秒）
        if (this.resultMoney) {
            const changeNumberComp = this.resultMoney.getComponent(ChangeNumberComponent);
            if (changeNumberComp) {
                changeNumberComp.playChangeNumber(0, this._winningCoin, null, 1);
            }
        }

        // 播放弹窗音效并在音效结束后恢复低音量
        const popupAudio = SlotSoundController.Instance().playAudio(this._soudnName, "FX");
        const audioDuration = popupAudio ? popupAudio.getDuration() : 0;

        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 自动旋转模式下，15秒后自动关闭弹窗
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                this._autoClose = true;
                this.onClickCollect();
            }, 15);
        }
    }

    /**
     * 点击领取按钮（处理分享判断、停止音效、触发特效流程）
     */
    public onClickCollect(): void {
        // 取消所有未执行的定时器，防止重复触发
        this.unscheduleAllCallbacks();

        // 禁用领取按钮、显示顶层遮罩、停止弹窗音效
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }
        if (this.topBlockNode) {
            this.topBlockNode.active = true;
        }
        SlotSoundController.Instance().stopAudio(this._soudnName, "FX");

        // 判断分享条件：未禁用FB分享、已勾选分享、非自动关闭
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget();
        const needShare = (isFBShareDisabled !== 1) 
            && this.toggleShare?.isChecked 
            && !this._autoClose;

        // 有分享需求则执行FB分享，否则直接播放爆炸特效
        if (needShare) {
            SlotManager.Instance.facebookShare(this.getLockNRollShareInfo(), () => {
                this.playExplodeCoinEffect();
            });
        } else {
            this.playExplodeCoinEffect();
        }
    }

    /**
     * 播放金币爆炸与收集特效（核心特效流程，完成后应用奖金结果）
     */
    public playExplodeCoinEffect(): void {
        // 计算金币收集特效目标位置（世界坐标转节点本地坐标）
        if (!this.winCoinCollectFx) return;

        const bigwinCoinTarget = SlotManager.Instance._inGameUI.bigwinCoinTarget;
        if (!bigwinCoinTarget) return;

        const worldPos = bigwinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent.convertToNodeSpace(new cc.Vec2(worldPos.x, worldPos.y));
        this.winCoinCollectFx.setPosition(localPos);

        // 定义特效启动回调
        const startEffectCallback = cc.callFunc(() => {
            // 显示金币爆炸动画、隐藏弹窗、关闭分享组件
            if (this.winExplodeCoin) {
                this.winExplodeCoin.node.active = true;
                this.winExplodeCoin.stop();
                this.winExplodeCoin.play();
            }
            if (this.root) {
                this.root.opacity = 0;
            }
            if (this.rootShareComponent) {
                this.rootShareComponent.active = false;
            }

            // 播放金币爆炸音效
            SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");

            // 延迟播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 延迟显示收集特效
            this.scheduleOnce(() => {
                if (this.winCoinCollectFx) {
                    this.winCoinCollectFx.active = true;
                }
            }, 1.35);

            // 延迟隐藏收集特效
            this.scheduleOnce(() => {
                if (this.winCoinCollectFx) {
                    this.winCoinCollectFx.active = false;
                }
            }, 2.3);
        });

        // 执行特效序列：启动特效 → 延迟 → 应用奖金 → 延迟 → 结束流程
        this.node.runAction(
            cc.sequence(
                startEffectCallback,
                cc.delayTime(1.8),
                cc.callFunc(() => {
                    // 应用游戏奖金结果
                    SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._winningCoin);
                }),
                cc.delayTime(1.2),
                cc.callFunc(() => {
                    // 结束弹窗流程
                    this.endProcess();
                })
            )
        );
    }

    /**
     * 获取 Lock&Roll 分享信息（用于 Facebook 分享）
     * @returns Facebook 分享信息对象
     */
    public getLockNRollShareInfo(): any {
        // 获取基础分享信息并补充 Lock&Roll 专属内容
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Bonus Game";
        shareInfo.subInfo.img = "slot-zhuquefortune-bonus-20250919.jpg";
        shareInfo.subInfo.tl = "Lock & Roll Baby!";
        shareInfo.desc = "Oh boy, what a win! \nCome and get your fun wins now!";

        return shareInfo;
    }

    /**
     * 结束弹窗流程（恢复音量、开启交互、隐藏弹窗、执行回调）
     */
    public endProcess(): void {
        // 恢复主音量、开启鼠标拖拽交互、隐藏弹窗
        SoundManager.Instance().resetTemporarilyMainVolume();
        SlotManager.Instance.setMouseDragEventFlag(true);
        this.node.active = false;

        // 执行弹窗结束回调
        if (this._callback) {
            this._callback();
        }
    }
}