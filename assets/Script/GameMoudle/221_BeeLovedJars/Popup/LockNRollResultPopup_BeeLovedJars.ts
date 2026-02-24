import ChangeNumberComponent from "../../../Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../../global_utility/CurrencyFormatHelper";
import SlotManager from "../../../manager/SlotManager";
import SoundManager from "../../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Lock&Roll 玩法结果弹窗组件
 * 负责Lock&Roll结果弹窗的尺寸适配、UI初始化、数字滚动、FB分享、金币爆炸特效、奖金应用
 */
@ccclass('LockNRollResultPopup_BeeLovedJars')
export default class LockNRollResultPopup_BeeLovedJars extends cc.Component {
    // ===================== 核心UI节点/组件 =====================
    // 弹窗根节点
    @property({
        type: cc.Node,
        displayName: "弹窗根节点",
        tooltip: "控制弹窗整体透明度的根节点"
    })
    root: cc.Node | null = null;

    // 遮罩背景节点（阻挡底层交互）
    @property({
        type: cc.Node,
        displayName: "遮罩背景节点",
        tooltip: "弹窗底层的全屏遮罩节点"
    })
    blockingBG: cc.Node | null = null;

    // 装饰节点（适配Canvas尺寸）
    @property({
        type: cc.Node,
        displayName: "装饰节点",
        tooltip: "需要适配Canvas尺寸+5的装饰节点"
    })
    deco_Node: cc.Node | null = null;

    // 弹窗核心动画组件
    @property({
        type: cc.Animation,
        displayName: "弹窗动画组件",
        tooltip: "控制Lock&Roll结果弹窗播放的核心动画组件"
    })
    startAni:cc.Animation | null = null;

    // 金额显示节点数组（两个节点：分别显示1e9以下/以上金额）
    @property({
        type: [cc.Node],
        displayName: "金额显示节点数组",
        tooltip: "包含ChangeNumberComponent的金额滚动显示节点（索引0：1e9以下，索引1：1e9以上）"
    })
    amountLabels: cc.Node[] | null = [];

    // 每线投注倍数标签
    @property({
        type: cc.Label,
        displayName: "每线倍数标签",
        tooltip: "显示X+倍数的标签（总奖金/次数向下取整）"
    })
    lineBetLabel: cc.Label | null = null;

    // 收集按钮
    @property({
        type: cc.Button,
        displayName: "收集按钮",
        tooltip: "点击关闭弹窗/触发分享的按钮"
    })
    collectButton: cc.Button | null = null;

    // 分享开关Toggle
    @property({
        type: cc.Toggle,
        displayName: "分享开关",
        tooltip: "控制是否分享到Facebook的Toggle组件"
    })
    toggleShare: cc.Toggle | null = null;

    // 长背景节点（奖金≥1e9时显示）
    @property({
        type: cc.Node,
        displayName: "长背景节点",
        tooltip: "奖金≥1e9时显示的背景节点"
    })
    long_BG: cc.Node | null = null;

    // 短背景节点（奖金<1e9时显示）
    @property({
        type: cc.Node,
        displayName: "短背景节点",
        tooltip: "奖金<1e9时显示的背景节点"
    })
    short_BG: cc.Node | null = null;

    // 分享组件根节点
    @property({
        type: cc.Node,
        displayName: "分享组件根节点",
        tooltip: "控制FB分享组件显示/隐藏的根节点"
    })
    rootShareComponent: cc.Node | null = null;

    // 初始化时需要隐藏的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化隐藏节点数组",
        tooltip: "弹窗初始化时需要设置为active=false的节点数组"
    })
    nodesInitActive: cc.Node[] | null = [];

    // 初始化时需要缩放到0的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化缩放节点数组",
        tooltip: "弹窗初始化时需要设置scale=0的节点数组"
    })
    nodesInitScale: cc.Node[] | null = [];

    // 初始化时需要透明的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化透明节点数组",
        tooltip: "弹窗初始化时需要设置opacity=0的节点数组"
    })
    nodesInitOpacity: cc.Node[] | null = [];

    // 金币爆炸动画组件
    @property({
        type: cc.Animation,
        displayName: "金币爆炸动画",
        tooltip: "点击收集后播放的金币爆炸动画组件"
    })
    winExplodeCoin: cc.Animation | null = null;

    // 金币收集特效节点
    @property({
        type: cc.Node,
        displayName: "金币收集特效节点",
        tooltip: "金币爆炸后飞向目标的特效节点"
    })
    winCoinCollectFx: cc.Node | null = null;

    // 顶部遮挡节点（点击收集后激活）
    @property({
        type: cc.Node,
        displayName: "顶部遮挡节点",
        tooltip: "点击收集后激活的顶部遮挡节点"
    })
    topBlockNode: cc.Node | null = null;

    // ===================== 私有状态变量 =====================
    // 弹窗关闭回调函数
    private _callback: (() => void) | null = null;
    // 总中奖金额
    private _winningCoin: number = 0;
    // 是否自动关闭（自动旋转模式下）
    private _autoClose: boolean = false;
    // 是否已点击收集按钮（防止重复点击）
    private _isClicked: boolean = false;
    // 弹窗音效名称（原代码拼写错误，保留以兼容音效配置）
    private _soudnName: string = "ResultPopup";

    /**
     * 组件加载：初始化尺寸+添加FB分享组件
     */
    onLoad(): void {
        // 1. 获取场景Canvas组件（空值检查避免报错）
        const canvasComponent = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvasComponent || !canvasComponent.node) {
            console.warn("未找到Canvas组件，节点尺寸适配失败");
            return;
        }
        const canvasSize = canvasComponent.node.getContentSize();

        // 2. 适配遮罩/装饰/顶部遮挡节点尺寸
        if (this.blockingBG && this.blockingBG.isValid) {
            this.blockingBG.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
        if (this.deco_Node && this.deco_Node.isValid) {
            this.deco_Node.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
        if (this.topBlockNode && this.topBlockNode.isValid) {
            this.topBlockNode.setContentSize(canvasSize.width, canvasSize.height); // 原代码无+5，保留
        }

        // 3. 给分享开关添加FBShareFlagToStorageInGame组件
        // if (this.toggleShare && this.toggleShare.node) {
        //     if (!this.toggleShare.node.getComponent(FBShareFlagToStorageInGame)) {
        //         this.toggleShare.node.addComponent(FBShareFlagToStorageInGame);
        //     }
        // }
    }

    /**
     * 初始化弹窗状态：重置UI+禁用主音量+禁用鼠标拖拽
     */
    init(): void {
        // 1. 重置根节点透明度+激活遮罩
        this.root && this.root.isValid && (this.root.opacity = 255);
        this.blockingBG.active = true;

        // 2. 恢复收集按钮可交互+隐藏金币爆炸动画
        this.collectButton.interactable = true; // 原代码直接赋值，保留逻辑
        this.winExplodeCoin.node.active = false;

        // 3. 重置状态变量
        this._autoClose = false;
        this._isClicked = false;
        this._soudnName = "ResultPopup";

        // 4. 重置透明节点（opacity=0）
        if (this.nodesInitOpacity && this.nodesInitOpacity.length > 0) {
            this.nodesInitOpacity.forEach(node => {
                if (node && node.isValid) node.opacity = 0;
            });
        }

        // 5. 重置隐藏节点（active=false）
        if (this.nodesInitActive && this.nodesInitActive.length > 0) {
            this.nodesInitActive.forEach(node => {
                if (node && node.isValid) node.active = false;
            });
        }

        // 6. 重置缩放节点（scale=0）
        if (this.nodesInitScale && this.nodesInitScale.length > 0) {
            this.nodesInitScale.forEach(node => {
                if (node && node.isValid) node.scale = 0;
            });
        }

        // 7. 控制FB分享组件显示（禁用分享则隐藏）
        if (this.rootShareComponent && this.rootShareComponent.isValid) {
            this.rootShareComponent.active = SlotManager.Instance.isFBShareDisableTarget() !== 1;
        }

        // 8. 重置金额标签为0
        if (this.amountLabels && this.amountLabels.length > 0) {
            this.amountLabels.forEach(node => {
                if (node && node.isValid) {
                    const label = node.getComponent(cc.Label);
                    if (label) label.string = "0";
                }
            });
        }

        // 9. 激活弹窗+隐藏顶部遮挡+禁用鼠标拖拽+临时静音
        this.node.active = true;
        this.topBlockNode.active = false;
        SlotManager.Instance.setMouseDragEventFlag(false);
        SoundManager.Instance()?.setMainVolumeTemporarily(0);
    }

    /**
     * 打开弹窗：初始化+计算倍数+播放动画/音效+数字滚动+自动关闭逻辑
     * @param winningCoin 总中奖金额
     * @param totalCnt 总次数（用于计算每线倍数）
     * @param callback 弹窗关闭后的回调函数
     */
    open(winningCoin: number, totalCnt: number, callback?: () => void): void {
        const self = this;
        // 1. 初始化弹窗
        this.init();

        // 2. 计算每线倍数（总奖金/总次数，向下取整）
        const lineBetMultiple = Math.floor(winningCoin / totalCnt);
        
        // 3. 设置倍数标签
        if (this.lineBetLabel) {
            this.lineBetLabel.string = "X" + CurrencyFormatHelper.formatNumber(lineBetMultiple);
        }

        // 4. 播放弹窗动画（重置到开头）
        if (this.startAni && this.startAni.isValid) {
            this.startAni.stop();
            this.startAni.play(); // 播放默认动画
            this.startAni.setCurrentTime(0);
        }

        // 5. 保存总奖金和回调
        this._winningCoin = winningCoin;
        this._callback = callback || null;

        // 6. 判断金额显示节点（1e9为分界）
        const amountType = winningCoin >= 1e9 ? 1 : 0;
        if (this.amountLabels && this.amountLabels.length >= 2) {
            this.amountLabels[0].active = amountType === 0;
            this.amountLabels[1].active = amountType === 1;
        }

        // 7. 切换长短背景
        this.long_BG!.active = winningCoin >= 1e9; // 原代码直接赋值，保留逻辑
        this.short_BG!.active = winningCoin < 1e9;

        // 8. 播放数字滚动动画（0到总奖金，时长1秒）
        if (this.amountLabels && this.amountLabels.length > 0) {
            this.amountLabels.forEach(node => {
                if (node && node.isValid) {
                    const changeNumberComp = node.getComponent(ChangeNumberComponent);
                    changeNumberComp?.playChangeNumber(0, self._winningCoin, null, 1);
                }
            });
        }

        // 9. 播放弹窗音效，并在音效结束后恢复少量音量
        const soundInst = SlotSoundController.Instance()?.playAudio(this._soudnName, "FX");
        const soundDuration = soundInst ? soundInst.getDuration() : 0;
        this.scheduleOnce(() => {
            SoundManager.Instance()?.setMainVolumeTemporarily(0.1);
        }, soundDuration);

        // 10. 自动旋转模式下，15秒后自动关闭
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                self._autoClose = true;
                self.onClickCollect();
            }, 15);
        }
    }

    /**
     * 点击收集按钮：停止回调+禁用按钮+停止音效+判断FB分享条件
     */
    onClickCollect(): void {
        const self = this;
        // 已点击则直接返回，防止重复执行
        if (this._isClicked) return;

        // 1. 停止所有计划任务+禁用收集按钮+激活顶部遮挡
        this.unscheduleAllCallbacks();
        this.collectButton!.interactable = false;
        this.topBlockNode.active = true;

        // 2. 停止弹窗音效+标记为已点击
        SlotSoundController.Instance()?.stopAudio(this._soudnName, "FX");
        this._isClicked = true;

        // 3. 判断FB分享条件：未禁用分享 + 分享开关勾选 + 非自动关闭 → 执行分享，否则直接播放金币特效
        const isFBShareEnable = SlotManager.Instance.isFBShareDisableTarget() !== 1;
        const isShareChecked = this.toggleShare?.isChecked || false;
        if (isFBShareEnable && isShareChecked && !this._autoClose) {
            SlotManager.Instance.facebookShare(this.getLockNRollShareInfo(), () => {
                self.playExplodeCoinEffect();
            });
        } else {
            this.playExplodeCoinEffect();
        }
    }

    /**
     * 播放金币爆炸特效：坐标转换+动画时序+奖金应用
     */
    playExplodeCoinEffect(): void {
        const self = this;
        if (!this.winCoinCollectFx || !this.winCoinCollectFx.parent || !SlotManager.Instance._inGameUI?.bigwinCoinTarget) {
            console.warn("金币特效依赖节点缺失，跳过特效播放");
            this.endProcess();
            return;
        }

        // 1. 转换目标坐标（世界坐标 → 特效父节点本地坐标）
        const worldPos = SlotManager.Instance._inGameUI.bigwinCoinTarget.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.winCoinCollectFx.parent.convertToNodeSpace(new cc.Vec2(worldPos.x, worldPos.y));
        this.winCoinCollectFx.setPosition(localPos);

        // 2. 构建特效播放时序动作
        const playEffectAction = cc.callFunc(function() {
            // 播放金币爆炸动画
            if (this.winExplodeCoin && this.winExplodeCoin.node) {
                this.winExplodeCoin.node.active = true;
                this.root!.opacity = 0; // 原代码直接赋值，保留逻辑
                this.rootShareComponent!.active = false;
                this.winExplodeCoin.stop();
                this.winExplodeCoin.play();
            }

            // 播放金币爆炸音效
            SlotSoundController.Instance()?.playAudio("BigWin_CoinBurst", "FX");

            // 延迟1.1秒播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance()?.playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 延迟1.35秒显示收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx!.active = true;
            }, 1.35);

            // 延迟2.3秒隐藏收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx!.active = false;
            }, 2.3);
        }.bind(this));

        // 3. 执行时序动作：播放特效 → 延迟 → 应用奖金 → 延迟 → 结束流程
        this.node.runAction(cc.sequence([
            playEffectAction,
            cc.delayTime(1.8),
            cc.callFunc(() => {
                // 应用游戏奖金
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(self._winningCoin);
            }),
            cc.delayTime(1.2),
            cc.callFunc(() => {
                self.endProcess();
            })
        ]));
    }

    /**
     * 构建Lock&Roll FB分享信息
     * @returns 符合格式的FB分享信息对象
     */
    getLockNRollShareInfo(): any {
        // 1. 获取基础分享信息
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo() as any;
        
        // 2. 补充Lock&Roll专属信息
        shareInfo.subInfo.st = "Bonus Game";
        shareInfo.subInfo.img = "slot-beelovedjars-locknroll-20251016.jpg";
        shareInfo.subInfo.tl = "Lock & Roll Baby!";
        shareInfo.desc = "Oh boy, what a win! \nCome and get your fun wins now!";

        return shareInfo;
    }

    /**
     * 弹窗结束流程：重置音量+恢复鼠标拖拽+隐藏弹窗+执行回调
     */
    endProcess(): void {
        // 1. 重置临时主音量+恢复鼠标拖拽
        SoundManager.Instance()?.resetTemporarilyMainVolume();
        SlotManager.Instance.setMouseDragEventFlag(true);

        // 2. 隐藏弹窗+执行关闭回调（清空防止重复调用）
        this.node.active = false;
        if (this._callback) {
            this._callback();
            this._callback = null;
        }
    }
}