import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import NumberFormatHelper from "../../global_utility/NumberFormatHelper";
import ViewResizeManager from "../../global_utility/ViewResizeManager";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import { FBShareInfo } from "../../slot_common/SlotDataDefine";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - Lock&Roll结果弹窗组件
 * 核心职责：
 * 1. 显示Lock&Roll游戏结果，播放打开动画和音效
 * 2. 控制奖金数字滚动、分享开关、领取按钮交互
 * 3. 播放金币爆炸/收集特效，处理奖金领取逻辑
 * 4. 适配视图大小调整，控制背景遮罩/装饰节点尺寸
 */
@ccclass()
export default class LockNRollResultPopup_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 弹窗打开动画组件 */
    @property(cc.Animation)
    public openAni: cc.Animation = null;

    /** 遮罩背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    /** 装饰节点（适配视图大小） */
    @property(cc.Node)
    public deco_Node: cc.Node = null;

    /** 奖金显示标签数组（数字滚动） */
    @property([cc.Label])
    public rewardLabels: cc.Label[] = [];

    /** 领取按钮 */
    @property(cc.Button)
    public collectButton: cc.Button = null;

    /** 分享开关 */
    @property(cc.Toggle)
    public shareToggle: cc.Toggle = null;

    /** 分享区域根节点 */
    @property(cc.Node)
    public shareRoot: cc.Node = null;

    /** 单注倍数标签 */
    @property(cc.Label)
    public lineBetLabel: cc.Label = null;

    /** 长背景（大额奖金显示） */
    @property(cc.Node)
    public logBG: cc.Node = null;

    /** 短背景（小额奖金显示） */
    @property(cc.Node)
    public shortBG: cc.Node = null;

    /** 弹窗根节点 */
    @property(cc.Node)
    public root: cc.Node = null;

    /** 初始化时需要缩放的节点数组 */
    @property([cc.Node])
    public nodesInitScale: cc.Node[] = [];

    /** 初始化时需要调整透明度的节点数组 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 赢钱金币爆炸动画组件 */
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation = null;

    /** 赢钱金币收集特效节点 */
    @property(cc.Node)
    public winCoinCollectFx: cc.Node = null;

    // ====== 私有状态属性 ======
    /** 获奖金币金额 */
    private _winningCoin: number = 0;

    /** 弹窗关闭后的回调函数 */
    private _fnCallback: (() => void) = null;

    /** 是否自动关闭弹窗（自动旋转时） */
    private _isAutoClose: boolean = false;

    // ====== 生命周期方法 ======
    /**
     * 组件加载时初始化分享开关组件
     */
    onLoad(): void {
        if (this.shareToggle) {
            // 为分享开关添加FB分享标记存储组件
            // this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        } else {
            console.warn("LockNRollResultPopup: shareToggle未配置！");
        }
    }

    /**
     * 组件激活时添加视图调整监听并刷新布局
     */
    onEnable(): void {
        this.onAfterResizeView();
        if (ViewResizeManager.Instance()) {
            ViewResizeManager.Instance().addHandler(this);
        } else {
            console.warn("LockNRollResultPopup: ViewResizeManager.Instance获取失败！");
        }
    }

    /**
     * 组件失活时移除视图调整监听
     */
    onDisable(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    // ====== 核心方法 ======
    /**
     * 初始化弹窗状态
     */
    init(): void {
        // 激活根节点
        if (this.root) this.root.active = true;
        this.node.active = true;

        // 隐藏特效节点
        if (this.winExplodeCoin) this.winExplodeCoin.node.active = false;
        if (this.winCoinCollectFx) this.winCoinCollectFx.active = false;

        // 重置自动关闭标记
        this._isAutoClose = false;
    }

    /**
     * 打开Lock&Roll结果弹窗
     * @param winningCoin 获奖金币金额
     * @param lineBet 单注金额
     * @param callback 弹窗关闭后的回调
     */
    open(winningCoin: number, lineBet: number, callback?: () => void): void {
        const self = this;
        // 1. 初始化弹窗状态
        this.init();

        // 2. 禁用鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(false);

        // 3. 临时降低主音量
        SoundManager.Instance().setMainVolumeTemporarily(0.1);

        // 4. 播放弹窗打开音效并控制音量
        const audioClip = SlotSoundController.Instance().playAudio("LockNRollResultPopup", "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;
        SoundManager.Instance().setMainVolumeTemporarily(0);
        
        // 音效播放后恢复部分音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 5. 根据奖金金额选择背景样式（10亿为分界）
        if (this.logBG && this.shortBG) {
            if (winningCoin < 1e9) {
                this.logBG.active = false;
                this.shortBG.active = true;
            } else {
                this.logBG.active = true;
                this.shortBG.active = false;
            }
        }

        // 6. 初始化节点透明度和缩放
        this.nodesInitOpacity.forEach(node => {
            if (node) node.opacity = 0;
        });
        this.nodesInitScale.forEach(node => {
            if (node) node.scale = 0;
        });

        // 7. 控制分享区域显示（FB分享未禁用时显示）
        if (this.shareRoot) {
            this.shareRoot.active = SlotManager.Instance.isFBShareDisableTarget() === 0;
        }

        // 8. 保存奖金金额和回调
        this._winningCoin = winningCoin;
        this._fnCallback = callback || null;

        // 9. 计算并显示单注倍数
        const betMultiplier = Math.floor(winningCoin / lineBet);
        if (this.lineBetLabel) {
            this.lineBetLabel.string = "X" + NumberFormatHelper.formatNumber(betMultiplier);
        }

        // 10. 播放奖金数字滚动动画
        this.rewardLabels.forEach(label => {
            const changeNumberComp = label.getComponent(ChangeNumberComponent);
            if (changeNumberComp) {
                changeNumberComp.playChangeNumber(0, winningCoin, null, 0.5);
            }
        });

        // 11. 播放弹窗打开动画
        if (this.openAni) {
            this.openAni.setCurrentTime(0);
            this.openAni.play();
        }

        // 12. 激活领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = true;
        }

        // 13. 自动旋转模式下15秒后自动领取
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                self._isAutoClose = true;
                self.onClickCollect();
            }, 15);
        }
    }

    /**
     * 点击领取按钮的处理逻辑
     */
    onClickCollect(): void {
        // 1. 取消所有定时回调
        this.unscheduleAllCallbacks();

        // 2. 禁用领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 3. 停止弹窗打开音效
        SlotSoundController.Instance().stopAudio("LockNRollResultPopup", "FX");

        // 4. 处理分享逻辑：未自动关闭且分享开关勾选时执行FB分享，否则直接播放金币特效
        const isShareEnabled = SlotManager.Instance.isFBShareDisableTarget() === 0;
        const isShareChecked = this.shareToggle ? this.shareToggle.isChecked : false;
        
        if (isShareEnabled && isShareChecked && !this._isAutoClose) {
            SlotManager.Instance.facebookShare(this.getLockAndRollShareInfo(), () => {
                this.playExplodeCoinEffect();
            });
        } else {
            this.playExplodeCoinEffect();
        }
    }

    /**
     * 播放金币爆炸和收集特效
     */
    playExplodeCoinEffect(): void {
        // 1. 计算金币收集特效目标位置（对齐到大赢金币目标节点）
        const bigWinCoinTarget = SlotManager.Instance.getBigWinCoinTarget();
        if (!bigWinCoinTarget || !this.winCoinCollectFx) {
            console.warn("LockNRollResultPopup: 金币目标节点/收集特效未配置！");
            this.endProcess();
            return;
        }

        const worldPos = bigWinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent?.convertToNodeSpaceAR(worldPos);
        
        if (localPos) {
            this.winCoinCollectFx.setPosition(localPos);
        }

        // 2. 隐藏弹窗根节点
        if (this.root) {
            this.root.active = false;
        }

        // 3. 定义金币爆炸动画序列
        const explodeSequence = cc.callFunc(() => {
            // 显示并播放金币爆炸动画
            if (this.winExplodeCoin) {
                this.winExplodeCoin.node.active = true;
            }
            // 隐藏遮罩背景
            if (this.blockingBG) {
                this.blockingBG.active = false;
            }
            // 播放爆炸动画
            if (this.winExplodeCoin) {
                this.winExplodeCoin.stop();
                this.winExplodeCoin.play();
            }

            // 播放金币爆炸音效
            SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");
            
            // 1.1秒后播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 1.35秒后显示收集特效
            this.scheduleOnce(() => {
                if (this.winCoinCollectFx) {
                    this.winCoinCollectFx.active = true;
                }
            }, 1.35);

            // 2.3秒后隐藏收集特效
            this.scheduleOnce(() => {
                if (this.winCoinCollectFx) {
                    this.winCoinCollectFx.active = false;
                }
            }, 2.3);
        });

        // 4. 执行完整的特效+奖金处理序列
        this.node.runAction(cc.sequence(
            explodeSequence,
            cc.delayTime(1.8), // 等待特效播放
            cc.callFunc(() => {
                // 应用游戏结果奖金
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._winningCoin);
            }),
            cc.delayTime(1.2), // 等待奖金应用完成
            cc.callFunc(() => {
                // 结束弹窗流程
                this.endProcess();
            })
        ));
    }

    /**
     * 获取Lock&Roll分享信息（FB分享用）
     * @returns FB分享信息对象
     */
    getLockAndRollShareInfo(): FBShareInfo {
        // 获取基础分享信息
        const baseShareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        
        // 补充Lock&Roll专属分享信息
        baseShareInfo.subInfo = {
            st: "Bonus Game",
            img: "slot-houndofhades-locknroll-20240530.jpg",
            tl: "Lock & Roll Baby!",
            desc: "Oh boy, what a win! \nCome and get your fun wins now!"
        };

        return baseShareInfo;
    }

    /**
     * 结束弹窗流程，恢复环境并执行回调
     */
    endProcess(): void {
        // 1. 恢复鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(true);

        // 2. 取消所有定时回调
        this.unscheduleAllCallbacks();

        // 3. 隐藏弹窗节点
        this.node.active = false;

        // 4. 重置主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 5. 执行回调函数
        if (this._fnCallback) {
            this._fnCallback();
            this._fnCallback = null; // 释放回调引用
        }
    }

    // ====== 视图大小调整回调 ======
    /**
     * 视图调整前回调（空实现，保留扩展）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图调整中回调（空实现，保留扩展）
     */
    onResizeView(): void {}

    /**
     * 视图调整后回调（适配遮罩/装饰节点尺寸）
     */
    onAfterResizeView(): void {
        // 获取Canvas节点
        const canvas = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvas || !canvas.node) return;

        const canvasSize = canvas.node.getContentSize();

        // 适配遮罩背景尺寸（2倍Canvas大小）
        if (this.blockingBG) {
            this.blockingBG.setContentSize(
                2 * canvasSize.width,
                2 * canvasSize.height
            );
        }

        // 适配装饰节点尺寸（Canvas大小+5）
        if (this.deco_Node) {
            this.deco_Node.setContentSize(
                canvasSize.width + 5,
                canvasSize.height + 5
            );
        }
    }
}