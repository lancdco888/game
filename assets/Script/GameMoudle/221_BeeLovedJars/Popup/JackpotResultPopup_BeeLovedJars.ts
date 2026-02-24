import ChangeNumberComponent from "../../../Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../../global_utility/CurrencyFormatHelper";
import SlotGameResultManager from "../../../manager/SlotGameResultManager";
import SlotManager from "../../../manager/SlotManager";
import SoundManager from "../../../manager/SoundManager";

const { ccclass, property } = cc._decorator;


/**
 * BeeLovedJars 游戏大奖结果弹窗组件
 * 负责大奖弹窗的尺寸适配、UI初始化、不同大奖类型的动画/音效/数字滚动、FB分享、金币爆炸特效
 */
@ccclass('JackpotResultPopup_BeeLovedJars')
export default class JackpotResultPopup_BeeLovedJars extends cc.Component {
    // ===================== 核心UI节点/组件 =====================
    // 弹窗根节点
    @property({
        type: cc.Node,
        displayName: "弹窗根节点",
        tooltip: "控制弹窗整体显示/透明度的根节点"
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
        tooltip: "控制大奖弹窗播放的核心动画组件"
    })
    startAni: cc.Animation | null = null;

    // 金额显示节点数组（两个节点：分别显示1e9以下/以上金额）
    @property({
        type: [cc.Node],
        displayName: "金额显示节点数组",
        tooltip: "包含ChangeNumberComponent的金额滚动显示节点（索引0：1e9以下，索引1：1e9以上）"
    })
    resultMoneys: cc.Node[] | null = [];

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

    // 初始化时需要透明的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化透明节点数组",
        tooltip: "弹窗初始化时需要设置opacity=0的节点数组"
    })
    nodesInitOpacity: cc.Node[] | null = [];

    // 初始化时需要缩放到0的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化缩放节点数组",
        tooltip: "弹窗初始化时需要设置scale=0的节点数组"
    })
    nodesInitScale: cc.Node[] | null = [];

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

    // 倍数显示标签
    @property({
        type: cc.Label,
        displayName: "倍数标签",
        tooltip: "显示X+倍数的标签（仅倍数模式显示）"
    })
    multi_Label: cc.Label | null = null;

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

    // ===================== 配置/状态变量 =====================
    // 大奖类型（0=mini,1=minor,2=major,3=mega）
    @property({
        displayName: "大奖类型",
        tooltip: "0=mini 1=minor 2=major 3=mega"
    })
    jackpotType: number = 0;

    // 是否执行收集逻辑（控制是否播放金币爆炸特效）
    @property({
        displayName: "是否执行收集",
        tooltip: "true=播放金币爆炸特效，false=直接结束"
    })
    isCollect: boolean = true;

    // 弹窗关闭回调函数
    private _callback: (() => void) | null = null;
    // 总中奖金额
    private _winningCoin: number = 0;
    // 是否自动关闭（自动旋转模式下）
    private _autoClose: boolean = false;
    // 是否已点击收集按钮（防止重复点击）
    private _isClicked: boolean = false;
    // 弹窗音效名称（原代码拼写错误，保留以兼容音效配置）
    private _soudnName: string = "";

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

        // 2. 适配遮罩/装饰/顶部遮挡节点尺寸（Canvas尺寸+5）
        if (this.blockingBG && this.blockingBG.isValid) {
            this.blockingBG.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
        if (this.deco_Node && this.deco_Node.isValid) {
            this.deco_Node.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
        if (this.topBlockNode && this.topBlockNode.isValid) {
            this.topBlockNode.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }

        // // 3. 给分享开关添加FBShareFlagToStorageInGame组件
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
        // 1. 激活根节点并重置透明度
        this.root.active = true;
        this.root && this.root.isValid && (this.root.opacity = 255);

        // 2. 激活遮罩+隐藏金币爆炸动画
        this.blockingBG.active = true;
        this.winExplodeCoin.node.active = false;

        // 3. 重置状态变量
        this._autoClose = false;
        this.collectButton!.interactable = true; // 原代码直接赋值，保留逻辑
        this._isClicked = false;
        this._soudnName = "JackpotReulstPopup"; // 原代码拼写，保留

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

        // 8. 激活弹窗+隐藏顶部遮挡+禁用鼠标拖拽+临时静音
        this.node.active = true;
        this.topBlockNode.active = false;
        SlotManager.Instance.setMouseDragEventFlag(false);
        SoundManager.Instance().setMainVolumeTemporarily(0);
    }

    /**
     * 显示大奖弹窗：初始化+选择动画/音效+数字滚动+自动关闭逻辑
     * @param jackpotInfo 大奖信息（winningCoin/baseWinningCoin/jackpot）
     * @param type 类型（<2=普通大奖，≥2=倍数大奖）
     * @param callback 弹窗关闭后的回调函数
     */
    showPopup(jackpotInfo: any, type: number, callback?: () => void): void {
        const self = this;
        // 1. 初始化弹窗
        this.init();

        // 2. 选择音效/动画名称
        this._soudnName = type < 2 ? "JackpotReulstPopup" : "JackpotReulstPopup_Multi";
        const aniName = type < 2 ? "JP_ani" : "JP_ani_multi";

        // 3. 播放弹窗动画（重置到开头）
        if (this.startAni && this.startAni.isValid) {
            this.startAni.stop();
            this.startAni.play(aniName);
            this.startAni.setCurrentTime(0);
        }

        // 4. 计算总奖金
        this._winningCoin = type === 1 ? jackpotInfo.winningCoin : SlotGameResultManager.Instance.getTotalWinMoney();
        this._callback = callback || null;

        // 5. 切换金额显示节点/背景（1e9为分界）
        if (this.resultMoneys && this.resultMoneys.length >= 2) {
            this.resultMoneys[1].active = this._winningCoin >= 1e9;
            this.resultMoneys[0].active = this._winningCoin < 1e9;
        }
        this.long_BG!.active = this._winningCoin >= 1e9; // 原代码直接赋值，保留逻辑
        this.short_BG!.active = this._winningCoin < 1e9;

        // 6. 数字滚动逻辑（普通/倍数模式）
        const baseAmount = jackpotInfo.baseWinningCoin + jackpotInfo.jackpot;
        if (type < 2) {
            // 普通模式：0 → 总奖金（时长2.25秒）
            this.playChangeNumber(0, this._winningCoin, 2.25);
        } else {
            // 倍数模式：先显示基础金额，再滚动到总奖金
            if (this.multi_Label) {
                this.multi_Label.string = "X" + type.toString();
            }
            // 第一段：0 → 基础金额（2.25秒）
            this.playChangeNumber(0, baseAmount, 2.25);
            // 第二段：延迟4.27秒后，基础金额 → 总奖金（1.33秒）
            this.scheduleOnce(() => {
                self.playChangeNumber(baseAmount, self._winningCoin, 1.33);
            }, 4.27);
        }

        // 7. 播放弹窗音效，并在音效结束后恢复少量音量
        const soundInst = SlotSoundController.Instance()?.playAudio(this._soudnName, "FX");
        const soundDuration = soundInst ? soundInst.getDuration() : 0;
        this.scheduleOnce(() => {
            SoundManager.Instance()?.setMainVolumeTemporarily(0.1);
        }, soundDuration);

        // 8. 自动旋转模式下，15秒后自动关闭
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                self._autoClose = true;
                self.onClickCollect();
            }, 15);
        }
    }

    /**
     * 批量播放数字滚动动画
     * @param start 起始值
     * @param end 目标值
     * @param duration 滚动时长（秒）
     */
    private playChangeNumber(start: number, end: number, duration: number): void {
        if (!this.resultMoneys || this.resultMoneys.length === 0) return;
        this.resultMoneys.forEach(node => {
            if (node && node.isValid) {
                const changeNumberComp = node.getComponent(ChangeNumberComponent);
                changeNumberComp.playChangeNumber(start, end, null, duration);
            }
        });
    }

    /**
     * 点击收集按钮：停止回调+禁用按钮+停止音效+判断FB分享条件
     */
    onClickCollect(): void {
        const self = this;
        // 已点击则直接返回，防止重复执行
        if (this._isClicked) return;

        // 1. 激活顶部遮挡+停止所有计划任务
        this.topBlockNode.active = true;
        this.unscheduleAllCallbacks();

        // 2. 标记为已点击+禁用收集按钮
        this._isClicked = true;
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 3. 停止弹窗音效
        SlotSoundController.Instance()?.stopAudio(this._soudnName, "FX");

        // 4. 判断执行逻辑（是否收集 + 是否分享）
        const isFBShareEnable = SlotManager.Instance.isFBShareDisableTarget() !== 1;
        const isShareChecked = this.toggleShare?.isChecked || false;
        const needShare = isFBShareEnable && isShareChecked && !this._autoClose;

        if (this.isCollect) {
            // 执行收集逻辑：需要分享则先分享，否则直接播放金币爆炸特效
            needShare ? SlotManager.Instance.facebookShare(this.getJackpotShareInfo(), () => {
                self.playExplodeCoinEffect();
            }) : this.playExplodeCoinEffect();
        } else {
            // 不执行收集：需要分享则先分享，否则直接结束
            needShare ? SlotManager.Instance.facebookShare(this.getJackpotShareInfo(), () => {
                self.processEnd();
            }) : this.processEnd();
        }
    }

    /**
     * 播放金币爆炸特效：坐标转换+动画时序+奖金应用
     */
    playExplodeCoinEffect(): void {
        const self = this;
        if (!this.winCoinCollectFx || !this.winCoinCollectFx.parent || !SlotManager.Instance._inGameUI?.bigwinCoinTarget) {
            console.warn("金币特效依赖节点缺失，跳过特效播放");
            this.processEnd();
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
                this.root!.active = false;
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
                self.processEnd();
            })
        ]));
    }

    /**
     * 构建Jackpot FB分享信息（根据大奖类型选择图片/文案）
     * @returns 符合格式的FB分享信息对象
     */
    getJackpotShareInfo(): any {
        // 1. 选择分享图片
        let imgName = "";
        switch (this.jackpotType) {
            case 0: imgName = "slot-beelovedjars-jackpot-mini-20251016.jpg"; break;
            case 1: imgName = "slot-beelovedjars-jackpot-minor-20251016.jpg"; break;
            case 2: imgName = "slot-beelovedjars-jackpot-major-20251016.jpg"; break;
            case 3: imgName = "slot-beelovedjars-jackpot-mega-20251016.jpg"; break;
            default: imgName = "slot-beelovedjars-jackpot-mini-20251016.jpg";
        }

        // 2. 选择分享文案（格式化奖金金额）
        let desc = "";
        const formattedCoin = CurrencyFormatHelper.formatNumber(this._winningCoin);
        switch (this.jackpotType) {
            case 0: desc = "I just hit a Jackpot of %s coins! \nCome and claim your mega wins here!".format(formattedCoin); break;
            case 1: desc = "Woot woot!! \nI just hit a HUGE JACKPOT of %s coins! \nCan you get yours?".format(formattedCoin); break;
            case 2: desc = "Unbelievable! \nI just hit a MAJOR JACKPOT of %s coins! \nTap here and find your jackpots!".format(formattedCoin); break;
            case 3: desc = "Woah! \nI just got a COLOSSAL JACKPOT %s coins! \nTap now and test your luck!".format(formattedCoin); break;
            default: desc = "I just hit a Jackpot of %s coins! \nCome and claim your mega wins here!".format(formattedCoin);
        }

        // 3. 构建基础分享信息并补充Jackpot专属内容
        const shareInfo = SlotManager.Instance.slotInterface.makeBaseFacebookShareInfo() as any;
        shareInfo.subInfo.st = "Jackpot";
        shareInfo.subInfo.img = imgName;
        shareInfo.subInfo.tl = "I can not believe it!";
        shareInfo.desc = desc;

        return shareInfo;
    }

    /**
     * 弹窗结束流程：停止回调+隐藏弹窗+重置音量+执行回调
     */
    processEnd(): void {
        // 1. 停止所有计划任务
        this.unscheduleAllCallbacks();

        // 2. 隐藏弹窗+重置临时主音量
        this.node.active = false;
        SoundManager.Instance()?.resetTemporarilyMainVolume();

        // 3. 执行关闭回调（清空防止重复调用）
        if (this._callback) {
            this._callback();
            this._callback = null;
        }
    }
}