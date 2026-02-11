import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势 Jackpot 结果弹窗组件
 * 负责展示不同档位 Jackpot 奖金、处理领取交互、播放金币爆炸特效、支持专属 Facebook 分享
 */
@ccclass()
export default class JackpotResultPopup_Zhuquefortune extends cc.Component {
    // 弹窗根节点
    @property(cc.Node)
    public root: cc.Node = null;

    // 遮罩背景（阻止底层交互）
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    // 装饰节点（适配画布大小）
    @property(cc.Node)
    public deco_Node: cc.Node = null;

    // 弹窗启动动画组件
    @property(cc.Animation)
    public startAni: cc.Animation = null;

    // 奖金金额标签（显示最终 Jackpot 金币）
    @property(cc.Label)
    public resultMoney: cc.Label = null;

    // 领取按钮
    @property(cc.Button)
    public collectButton: cc.Button = null;

    // Jackpot 档位标题节点数组（对应 mini/minor/major/grand/doublegrand）
    @property([cc.Node])
    public titleNodes: cc.Node[] = [];

    // 分享切换开关（是否勾选分享）
    @property(cc.Toggle)
    public toggleShare: cc.Toggle = null;

    // 分享组件根节点
    @property(cc.Node)
    public rootShareComponent: cc.Node = null;

    // 初始化时需要隐藏的节点数组
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    // 初始化时需要透明的节点数组
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // 金币爆炸动画组件
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation = null;

    // 金币收集特效节点
    @property(cc.Node)
    public winCoinCollectFx: cc.Node = null;

    // 大额奖金背景（≥10亿）
    @property(cc.Node)
    public long_BG: cc.Node = null;

    // 小额奖金背景（<10亿）
    @property(cc.Node)
    public short_BG: cc.Node = null;

    // 顶层遮罩节点（防止领取后重复交互）
    @property(cc.Node)
    public topBlockNode: cc.Node = null;

    // 私有变量：回调函数（弹窗结束后执行）
    private _callback: (() => void) = null;

    // 私有变量：获胜 Jackpot 金币金额
    private _winningCoin: number = 0;

    // 私有变量：是否自动关闭（自动旋转模式下）
    private _autoClose: boolean = false;

    // 私有变量：是否已点击领取（防止重复点击）
    private _isClicked: boolean = false;

    // 私有变量：弹窗音效名称（保留原代码拼写 soudn → sound，避免影响音效调用）
    private _soudnName: string = "";

    // 私有变量：Jackpot 档位类型（0-4 对应 mini 到 doublegrand）
    private _jackpotType: number = 0;

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
            this.topBlockNode.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }

        // // 为分享开关添加 FB 分享存储组件
        // if (this.toggleShare && this.toggleShare.node) {
        //     this.toggleShare.node.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 初始化弹窗状态（重置所有节点、隐藏分享组件（如需）、关闭底层交互、初始化音效名称）
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

        // 重置私有状态变量与音效名称
        this._autoClose = false;
        this._isClicked = false;
        this._soudnName = "JackpotReulstPopup"; // 保留原代码拼写 Reulst → Result，避免影响音效调用

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

        // 隐藏所有 Jackpot 档位标题节点
        for (let i = 0; i < this.titleNodes.length; ++i) {
            const titleNode = this.titleNodes[i];
            if (titleNode) {
                titleNode.active = false;
            }
        }

        // 判断是否禁用 Facebook 分享，控制分享组件显隐
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget();
        if (this.rootShareComponent) {
            this.rootShareComponent.active = (isFBShareDisabled !== 1);
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
     * 显示 Jackpot 弹窗（展示对应档位、播放启动动画、处理自动关闭逻辑）
     * @param jackpotData Jackpot 数据对象（包含档位ID、获胜金币）
     * @param callback 弹窗结束后的回调函数
     */
    public showPopup(
        jackpotData: { jackpotSubID: number; winningCoin: number },
        callback?: () => void
    ): void {
        this.init();

        // 1. 激活对应档位的标题节点（做下标有效性判断，避免数组越界）
        if (jackpotData.jackpotSubID >= 0 && jackpotData.jackpotSubID < this.titleNodes.length) {
            const targetTitleNode = this.titleNodes[jackpotData.jackpotSubID];
            if (targetTitleNode) {
                targetTitleNode.active = true;
            }
        }

        // 2. 保存 Jackpot 档位类型、获胜金币和回调函数
        this._jackpotType = jackpotData.jackpotSubID;
        this._winningCoin = jackpotData.winningCoin;
        this._callback = callback;

        // 3. 播放启动动画（重置到起始帧）
        if (this.startAni) {
            this.startAni.stop();
            this.startAni.setCurrentTime(0);
            this.startAni.play();
        }

        // 4. 切换奖金背景（大额≥10亿，小额<10亿）
        if (this.long_BG && this.short_BG) {
            this.long_BG.active = (this._winningCoin >= 1e9);
            this.short_BG.active = (this._winningCoin < 1e9);
        }

        // 5. 播放数字变化动画（从0到获胜金币，时长2秒）
        if (this.resultMoney) {
            const changeNumberComp = this.resultMoney.getComponent(ChangeNumberComponent);
            if (changeNumberComp) {
                changeNumberComp.playChangeNumber(0, this._winningCoin, null, 2);
            }
        }

        // 6. 播放弹窗音效并在音效结束后恢复低音量
        const popupAudio = SlotSoundController.Instance().playAudio(this._soudnName, "FX");
        const audioDuration = popupAudio ? popupAudio.getDuration() : 0;

        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 7. 自动旋转模式下，15秒后自动关闭弹窗
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                this._autoClose = true;
                this.onClickCollect();
            }, 15);
        }
    }

    /**
     * 点击领取按钮（处理分享判断、停止音效、防止重复点击、触发特效流程）
     */
    public onClickCollect(): void {
        // 防止重复点击（已点击则直接返回）
        if (this._isClicked) return;

        // 1. 标记为已点击、取消所有未执行的定时器
        this._isClicked = true;
        this.unscheduleAllCallbacks();

        // 2. 显示顶层遮罩、禁用领取按钮、停止弹窗音效
        if (this.topBlockNode) {
            this.topBlockNode.active = true;
        }
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }
        SlotSoundController.Instance().stopAudio(this._soudnName, "FX");

        // 3. 判断分享条件：未禁用FB分享、已勾选分享、非自动关闭
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget();
        const needShare = (isFBShareDisabled !== 1) 
            && this.toggleShare?.isChecked 
            && !this._autoClose;

        // 4. 有分享需求则执行FB分享，否则直接播放爆炸特效
        if (needShare) {
            SlotManager.Instance.facebookShare(this.getJackpotShareInfo(), () => {
                this.playExplodeCoinEffect();
            });
        } else {
            this.playExplodeCoinEffect();
        }
    }

    /**
     * 播放金币爆炸与收集特效（核心特效流程，完成后应用 Jackpot 奖金结果）
     */
    public playExplodeCoinEffect(): void {
        // 校验必要节点有效性，避免后续逻辑报错
        if (!this.winCoinCollectFx) return;
        const bigwinCoinTarget = SlotManager.Instance._inGameUI.bigwinCoinTarget;
        if (!bigwinCoinTarget) return;

        // 1. 计算金币收集特效目标位置（世界坐标转节点本地坐标）
        const worldPos = bigwinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent.convertToNodeSpace(new cc.Vec2(worldPos.x, worldPos.y));
        this.winCoinCollectFx.setPosition(localPos);

        // 2. 定义特效启动回调
        const startEffectCallback = cc.callFunc(() => {
            // 显示金币爆炸动画、隐藏弹窗
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

        // 3. 执行特效序列：启动特效 → 延迟 → 应用奖金 → 延迟 → 结束流程
        this.node.runAction(
            cc.sequence(
                startEffectCallback,
                cc.delayTime(1.8),
                cc.callFunc(() => {
                    // 应用 Jackpot 奖金结果
                    SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._winningCoin);
                }),
                cc.delayTime(1.2),
                cc.callFunc(() => {
                    // 结束弹窗流程
                    this.processEnd();
                })
            )
        );
    }

    /**
     * 获取 Jackpot 专属分享信息（用于 Facebook 分享，根据档位返回不同图片和描述）
     * @returns Facebook 分享信息对象
     */
    public getJackpotShareInfo(): any {
        // 1. 根据 Jackpot 档位选择分享图片
        let shareImg = "";
        switch (this._jackpotType) {
            case 0:
                shareImg = "slot-zhuquefortune-jackpot-mini-20250919.jpg";
                break;
            case 1:
                shareImg = "slot-zhuquefortune-jackpot-minor-20250919.jpg";
                break;
            case 2:
                shareImg = "slot-zhuquefortune-jackpot-major-20250919.jpg";
                break;
            case 3:
                shareImg = "slot-zhuquefortune-jackpot-grand-20250919.jpg";
                break;
            case 4:
                shareImg = "slot-zhuquefortune-jackpot-doublegrand-20250919.jpg";
                break;
            default:
                shareImg = "slot-zhuquefortune-jackpot-mini-20250919.jpg";
                break;
        }

        // 2. 根据 Jackpot 档位选择分享描述（格式化奖金金额）
        const formattedWinningCoin = CurrencyFormatHelper.formatNumber(this._winningCoin);
        let shareDesc = "";
        switch (this._jackpotType) {
            case 0:
                shareDesc = `I just hit a Jackpot of ${formattedWinningCoin} coins! \nCome and claim your mega wins here!`;
                break;
            case 1:
                shareDesc = `Woot woot!! \nI just hit a HUGE JACKPOT of ${formattedWinningCoin} coins! \nCan you get yours?`;
                break;
            case 2:
                shareDesc = `Unbelievable! \nI just hit a MAJOR JACKPOT of ${formattedWinningCoin} coins! \nTap here and find your jackpots!`;
                break;
            case 3:
                shareDesc = `Woah! \nI just got a COLOSSAL JACKPOT ${formattedWinningCoin} coins! \nTap now and test your luck!`;
                break;
            case 4:
                shareDesc = `Incredible! \nI struck a MONSTROUS JACKPOT of ${formattedWinningCoin} coins! \nTap now and test your luck!`;
                break;
            default:
                shareDesc = `I just hit a Jackpot of ${formattedWinningCoin} coins! \nCome and claim your mega wins here!`;
                break;
        }

        // 3. 获取基础分享信息并补充 Jackpot 专属内容
        const shareInfo = SlotManager.Instance.slotInterface.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Jackpot";
        shareInfo.subInfo.img = shareImg;
        shareInfo.subInfo.tl = "I can not believe it!";
        shareInfo.desc = shareDesc;

        return shareInfo;
    }

    /**
     * 结束弹窗流程（恢复音量、开启交互、隐藏弹窗、执行回调）
     */
    public processEnd(): void {
        // 1. 取消所有未执行的定时器、恢复主音量
        this.unscheduleAllCallbacks();
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 2. 开启鼠标拖拽交互、隐藏弹窗
        SlotManager.Instance.setMouseDragEventFlag(true);
        this.node.active = false;

        // 3. 执行弹窗结束回调
        if (this._callback) {
            this._callback();
        }
    }
}