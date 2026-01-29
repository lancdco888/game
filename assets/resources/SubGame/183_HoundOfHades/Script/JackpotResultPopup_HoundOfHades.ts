import ChangeNumberComponent from "../../../../Script/Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import CurrencyFormatHelper from "../../../../Script/global_utility/CurrencyFormatHelper";
import ViewResizeManager from "../../../../Script/global_utility/ViewResizeManager";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../../Script/manager/SlotManager";
import SoundManager from "../../../../Script/manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - Jackpot（大奖）结果弹窗组件
 * 核心职责：
 * 1. 初始化Jackpot弹窗状态，控制节点透明度/缩放、遮罩显示
 * 2. 根据大奖类型/倍数播放对应动画，计算奖金并执行数字滚动
 * 3. 处理领取按钮点击逻辑（含FB分享判断），播放金币爆炸特效
 * 4. 适配视图大小调整，控制遮罩/装饰节点尺寸
 * 5. 支持自动旋转模式下的自动关闭，管理音效播放与音量调整
 */
@ccclass()
export default class JackpotResultPopup_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 弹窗根节点 */
    @property(cc.Node)
    public root: cc.Node | null = null;

    /** 遮罩背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    /** 装饰节点（适配视图大小） */
    @property(cc.Node)
    public deco_Node: cc.Node | null = null;

    /** 弹窗开始动画组件 */
    @property(cc.Animation)
    public startAni: cc.Animation | null = null;

    /** 长背景（大额奖金显示） */
    @property(cc.Node)
    public long_BG: cc.Node | null = null;

    /** 短背景（小额奖金显示） */
    @property(cc.Node)
    public short_BG: cc.Node | null = null;

    /** 奖金显示标签数组（数字滚动） */
    @property([cc.Label])
    public resultMoneys: cc.Label[] = [];

    /** 领取按钮 */
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    /** 分享开关 */
    @property(cc.Toggle)
    public toggleShare:cc.Toggle | null = null;

    /** 分享区域根节点 */
    @property(cc.Node)
    public rootShareComponent: cc.Node | null = null;

    /** 初始化时需要缩放的节点数组 */
    @property([cc.Node])
    public nodesInitScale: cc.Node[] = [];

    /** 初始化时需要调整透明度的节点数组 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 赢钱金币爆炸动画组件 */
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation | null = null;

    /** 赢钱金币收集特效节点 */
    @property(cc.Node)
    public winCoinCollectFx: cc.Node | null = null;

    /** Jackpot标题节点数组（按类型区分） */
    @property([cc.Node])
    public title_Nodes: cc.Node[] = [];

    /** Jackpot短标题节点数组（按类型区分） */
    @property([cc.Node])
    public short_title_Nodes: cc.Node[] = [];

    /** 倍数显示标签 */
    @property(cc.Label)
    public multi_Label: cc.Label | null = null;

    // ====== 私有状态属性 ======
    /** 弹窗关闭后的回调函数 */
    private _callback: (() => void) | null = null;

    /** 获奖金币金额 */
    private _winningCoin: number = 0;

    /** Jackpot类型（0:mini,1:minor,2:major,3:mega） */
    private _jackpotType: number = 0;

    /** 是否自动关闭弹窗（自动旋转模式） */
    private _autoClose: boolean = false;

    /** 按钮是否已点击（防止重复点击） */
    private _isClicked: boolean = false;

    /** 是否应用奖金（控制金币特效流程） */
    private _isApply: boolean = true;

    /** 音效名称（原代码拼写错误：soudn→sound，保留原命名） */
    private _soudnName: string = "";

    // ====== 生命周期方法 ======
    /**
     * 组件加载时为分享开关添加FB分享标记组件
     */
    onLoad(): void {
        if (this.toggleShare) {
            // this.toggleShare.addComponent(FBShareFlagToStorageInGame);
        } else {
            console.warn("JackpotResultPopup: toggleShare未配置！");
        }
    }

    /**
     * 组件激活时添加视图调整监听并刷新布局
     */
    onEnable(): void {
        this.onAfterResizeView();
        ViewResizeManager.Instance().addHandler(this);
    }

    /**
     * 组件失活时移除视图调整监听
     */
    onDisable(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    // ====== 核心方法 ======
    /**
     * 初始化弹窗基础状态
     */
    init(): void {
        // 重置根节点状态
        if (this.root) {
            this.root.opacity = 255;
            this.root.scale = 1;
        }

        // 隐藏金币爆炸特效
        if (this.winExplodeCoin) {
            this.winExplodeCoin.node.active = false;
        }

        // 显示遮罩背景
        if (this.blockingBG) {
            this.blockingBG.active = true;
        }

        // 禁用领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 初始化自动关闭标记
        this._autoClose = true;

        // 重置节点透明度
        this.nodesInitOpacity.forEach(node => {
            if (node) node.opacity = 0;
        });

        // 重置节点缩放
        this.nodesInitScale.forEach(node => {
            if (node) node.scale = 0;
        });

        // 隐藏所有标题节点
        this.title_Nodes.forEach(node => {
            if (node) node.active = false;
        });
        this.short_title_Nodes.forEach(node => {
            if (node) node.active = false;
        });

        // 激活弹窗节点
        this.node.active = true;

        // 禁用鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(false);
    }

    /**
     * 显示Jackpot结果弹窗
     * @param winningCoin 获奖金币金额
     * @param jackpotType Jackpot类型（0:mini,1:minor,2:major,3:mega）
     * @param callback 弹窗关闭后的回调函数
     * @param multi 倍数（默认1）
     * @param isApply 是否应用奖金（默认true）
     */
    showPopup(
        winningCoin: number,
        jackpotType: number,
        callback?: () => void,
        multi: number = 1,
        isApply: boolean = true
    ): void {
        const self = this;
        this.init();

        // 1. 选择动画名称（基础/2倍倍数）
        let aniName = "PU_Jackpot";
        if (multi > 1) {
            aniName = "PU_Jackpot_2X_Multi";
            if (this.multi_Label) {
                this.multi_Label.string = "X" + multi.toString();
            }
        }

        // 2. 播放弹窗动画
        if (this.startAni) {
            this.startAni.stop();
            this.startAni.play(aniName);
            this.startAni.setCurrentTime(0);
        }

        // 3. 初始化状态变量
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }
        this._winningCoin = winningCoin;
        this._jackpotType = jackpotType;
        this._autoClose = false;
        this._callback = callback || null;
        this._isApply = isApply;

        // 4. 根据奖金金额选择背景样式（10亿为分界）
        if (this.long_BG && this.short_BG) {
            if (winningCoin < 1e9) {
                this.long_BG.active = false;
                this.short_BG.active = true;
            } else {
                this.long_BG.active = true;
                this.short_BG.active = false;
            }
        }

        // 5. 显示对应类型的标题节点
        if (this.title_Nodes[this._jackpotType]) {
            this.title_Nodes[this._jackpotType].active = true;
        }
        if (this.short_title_Nodes[this._jackpotType]) {
            this.short_title_Nodes[this._jackpotType].active = true;
        }

        // 6. 计算奖金基数（处理倍数逻辑）
        let baseCoin = Math.floor(winningCoin / multi);
        if (multi === 1) {
            baseCoin = winningCoin;
        } else {
            let basePrize = 0;
            const jackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
            
            // 根据Jackpot类型获取基础奖金
            switch (this._jackpotType) {
                case 0:
                    basePrize = jackpotInfo.getJackpotMoneyInfo(0).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
                case 1:
                    basePrize = jackpotInfo.getJackpotMoneyInfo(1).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
                case 2:
                    basePrize = jackpotInfo.getJackpotMoneyInfo(2).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
                case 3:
                    basePrize = jackpotInfo.getJackpotMoneyInfo(3).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
            }

            // 修正奖金计算
            const extraCoin = this._winningCoin - basePrize * multi;
            baseCoin = basePrize + extraCoin;
        }

        // 7. 播放基础奖金数字滚动动画
        this.resultMoneys.forEach(label => {
            const changeNumComp = label.getComponent(ChangeNumberComponent);
            if (changeNumComp) {
                changeNumComp.playChangeNumber(0, baseCoin, null, 0.5);
            }
        });

        // 8. 倍数>1时，延迟播放最终奖金滚动动画
        if (multi > 1) {
            this.scheduleOnce(() => {
                self.resultMoneys.forEach(label => {
                    const changeNumComp = label.getComponent(ChangeNumberComponent);
                    if (changeNumComp) {
                        changeNumComp.playChangeNumber(baseCoin, self._winningCoin, null, 1);
                    }
                });
                if (self.collectButton) {
                    self.collectButton.interactable = true;
                }
            }, 2.25);
        } else {
            if (this.collectButton) {
                this.collectButton.interactable = true;
            }
        }

        // // 9. 确保分享开关添加了FB分享组件
        // if (this.toggleShare && !this.toggleShare.getComponent(FBShareFlagToStorageInGame)) {
        //     this.toggleShare.addComponent(FBShareFlagToStorageInGame);
        // }

        // 10. 控制分享区域显示（FB分享未禁用时显示）
        if (this.rootShareComponent) {
            this.rootShareComponent.active = SlotManager.Instance.isFBShareDisableTarget() === 0;
        }

        // 11. 选择音效名称并播放
        this._soudnName = "JackpotResultPopup"; // 原代码拼写错误：soudn → sound
        if (multi > 1) {
            this._soudnName = "JackpotResultPopup_Multi";
        }
        const audioClip = SlotSoundController.Instance().playAudio(this._soudnName, "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;
        
        // 临时调整主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 12. 激活领取按钮并重置点击标记
        if (this.collectButton) {
            this.collectButton.interactable = true;
        }
        this._isClicked = false;

        // 13. 自动旋转模式下15秒后自动领取
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                self._autoClose = true;
                self.onClickCollect();
            }, 15);
        }
    }

    /**
     * 点击领取按钮的处理逻辑（防止重复点击）
     */
    onClickCollect(): void {
        // 已点击过则直接返回
        if (this._isClicked) return;

        // 标记为已点击，防止重复触发
        this._isClicked = true;
        
        // 取消所有定时回调
        this.unscheduleAllCallbacks();

        // 禁用领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 停止弹窗音效
        SlotSoundController.Instance().stopAudio(this._soudnName, "FX");

        // 处理分享逻辑：未自动关闭且分享开关勾选时执行FB分享，否则直接播放金币特效
        const isShareEnabled = SlotManager.Instance.isFBShareDisableTarget() === 0;
        const isShareChecked = this.toggleShare ? this.toggleShare.isChecked : false;
        
        if (isShareEnabled && isShareChecked && !this._autoClose) {
            SlotManager.Instance.facebookShare(this.getJackpotShareInfo(), () => {
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
        const self = this;

        // 无需应用奖金时直接结束流程
        if (!this._isApply) {
            this.processEnd();
            return;
        }

        // 校验核心节点是否存在
        if (!SlotManager.Instance._inGameUI?.bigwinCoinTarget || !this.winCoinCollectFx || !this.winCoinCollectFx.parent) {
            console.warn("JackpotResultPopup: 金币目标节点/收集特效未配置！");
            this.processEnd();
            return;
        }

        // 1. 计算金币收集特效目标位置
        const worldPos = SlotManager.Instance._inGameUI.bigwinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent.convertToNodeSpace(new cc.Vec2(worldPos.x, worldPos.y));
        this.winCoinCollectFx.setPosition(localPos);

        // 2. 定义金币爆炸动画序列
        const explodeSequence = cc.callFunc(() => {
            // 显示并播放金币爆炸动画
            if (this.winExplodeCoin) {
                this.winExplodeCoin.node.active = true;
            }
            // 隐藏弹窗根节点
            if (this.root) {
                this.root.opacity = 0;
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

        // 3. 执行完整的特效+奖金处理序列
        this.node.runAction(cc.sequence(
            explodeSequence,
            cc.delayTime(1.8), // 等待特效播放
            cc.callFunc(() => {
                // 应用游戏结果奖金
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(self._winningCoin);
            }),
            cc.delayTime(1.2), // 等待奖金应用完成
            cc.callFunc(() => {
                // 结束弹窗流程
                self.processEnd();
            })
        ));
    }

    /**
     * 获取Jackpot分享信息（FB分享用）
     * @returns FB分享信息对象
     */
    getJackpotShareInfo(): any {
        // 1. 根据Jackpot类型选择分享图片
        let shareImg = "";
        switch (this._jackpotType) {
            case 0:
                shareImg = "slot-houndofhades-jackpot-mini-20240531.jpg";
                break;
            case 1:
                shareImg = "slot-houndofhades-jackpot-minor-20240531.jpg";
                break;
            case 2:
                shareImg = "slot-houndofhades-jackpot-major-20240531.jpg";
                break;
            case 3:
                shareImg = "slot-houndofhades-jackpot-mega-20240531.jpg";
                break;
        }

        // 2. 根据Jackpot类型选择分享文案
        let shareDesc = "";
        const formattedCoin = CurrencyFormatHelper.formatNumber(this._winningCoin);
        switch (this._jackpotType) {
            case 0:
                shareDesc = "I just hit a Jackpot of %s coins! \nCome and claim your mega wins here!".format(formattedCoin);
                break;
            case 1:
                shareDesc = "Woot woot!! \nI just hit a HUGE JACKPOT of %s coins! \nCan you get yours?".format(formattedCoin);
                break;
            case 2:
                shareDesc = "Unbelievable! \nI just hit a MAJOR JACKPOT of %s coins! \nTap here and find your jackpots!".format(formattedCoin);
                break;
            case 3:
                shareDesc = "Woah! \nI just got a COLOSSAL JACKPOT %s coins! \nTap now and test your luck!".format(formattedCoin);
                break;
        }

        // 3. 构建完整分享信息
        const baseShareInfo = SlotManager.Instance.slotInterface.makeBaseFacebookShareInfo();
        baseShareInfo.subInfo = {
            st: "Jackpot",
            img: shareImg,
            tl: "I can not believe it!"
        };
        baseShareInfo.desc = shareDesc;

        return baseShareInfo;
    }

    /**
     * 结束弹窗流程，恢复环境并执行回调
     */
    processEnd(): void {
        // 取消所有定时回调
        this.unscheduleAllCallbacks();

        // 隐藏弹窗节点
        this.node.active = false;

        // 重置临时调整的主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行回调函数（如有）
        if (this._callback) {
            this._callback();
            this._callback = null; // 释放回调引用，避免内存泄漏
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
        if (!canvas || !canvas.node || !this.blockingBG || !this.deco_Node) return;

        const canvasSize = canvas.node.getContentSize();
        
        // 适配遮罩背景和装饰节点尺寸（Canvas大小+5）
        this.blockingBG.setContentSize(
            canvasSize.width + 5,
            canvasSize.height + 5
        );
        this.deco_Node.setContentSize(
            canvasSize.width + 5,
            canvasSize.height + 5
        );
    }

    /**
     * 刷新视图布局（调整遮罩位置和尺寸）
     */
    refreshView(): void {
        const canvas = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvas || !canvas.node || !this.blockingBG || !this.blockingBG.parent) return;

        const canvasSize = canvas.node.getContentSize();
        const canvasCenter = new cc.Vec2(Math.floor(canvasSize.width / 2), Math.floor(canvasSize.height / 2));
        const localCenter = this.blockingBG.parent.convertToNodeSpaceAR(canvasCenter);

        // 调整遮罩位置和尺寸
        this.blockingBG.setPosition(this.blockingBG.x, localCenter.y);
        this.blockingBG.setContentSize(canvasSize.width + 200, canvasSize.height + 200);
    }
}