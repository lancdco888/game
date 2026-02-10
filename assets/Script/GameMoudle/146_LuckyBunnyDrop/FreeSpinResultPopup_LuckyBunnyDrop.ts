import SlotSoundController from "../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;



/**
 * LuckyBunnyDrop 免费旋转/LockAndRoll结果弹窗组件
 * 负责双模式（FreeSpin/LockAndRoll）结果展示、金额格式化、FB分享、动画/音效控制、自动关闭等逻辑
 */
@ccclass('FreeSpinResultPopup_LuckyBunnyDrop')
export default class FreeSpinResultPopup_LuckyBunnyDrop extends cc.Component {
    // 遮罩背景节点（阻止底层交互，适配画布大小）
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    // 装饰节点（适配画布大小）
    @property(cc.Node)
    public decoNode: cc.Node | null = null;

    // 奖励金额显示标签
    @property(cc.Label)
    public rewardLabel: cc.Label | null = null;

    // 收集按钮
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    // 分享开关
    @property(cc.Toggle)
    public shareToggle: cc.Toggle | null = null;

    // 线注倍数显示标签
    @property(cc.Label)
    public lineBetLabel: cc.Label | null = null;

    // 免费旋转次数显示标签
    @property(cc.Label)
    public freespinCountLabel: cc.Label | null = null;

    // 弹窗启动动画组件
    @property(cc.Animation)
    public startAnimation: cc.Animation | any = null;

    // 需要初始化透明度为0的节点数组
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // 需要初始化隐藏的节点数组
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    // FreeSpin模式节点（显示/隐藏）
    @property(cc.Node)
    public freeSpin_Node: cc.Node | null = null;

    // LockAndRoll模式节点（显示/隐藏）
    @property(cc.Node)
    public lockAndRoll_Node: cc.Node | null = null;

    // 私有变量：奖励金额
    private _goldAmount: number = 0;
    // 私有变量：弹窗关闭后的回调函数
    private _fnCallback: Function | null = null;
    // 私有变量：是否自动关闭
    private _isAutoClose: boolean = false;
    // 私有变量：是否为FreeSpin模式（false=LockAndRoll模式）
    private _isFreeSpin: boolean = false;

    /**
     * 组件加载时执行（Cocos生命周期）
     * 适配遮罩背景和装饰节点大小 + 添加FB分享存储组件
     */
    public onLoad(): void {
        // 适配画布大小
        const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (canvasComp?.node && this.blockingBG && this.decoNode) {
            const canvasSize = canvasComp.node.getContentSize();
            this.blockingBG.setContentSize(canvasSize);
            this.decoNode.setContentSize(canvasSize);
        }

        // // 为分享开关添加FB分享标记存储组件
        // if (this.shareToggle) {
        //     this.shareToggle.node.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 初始化弹窗状态（重置节点透明度和激活状态）
     */
    public setInitPopup(): void {
        // 重置透明度节点为0
        for (const node of this.nodesInitOpacity) {
            node.opacity = 0;
        }

        // 重置激活节点为隐藏
        for (const node of this.nodesInitActive) {
            node.active = false;
        }
    }

    /**
     * 打开结果弹窗
     * @param goldAmount 奖励金额
     * @param lineBet 线注金额
     * @param freespinCount 免费旋转次数
     * @param callback 弹窗关闭后的回调函数
     * @param isFreeSpin 是否为FreeSpin模式（默认true，false=LockAndRoll模式）
     */
    public open(
        goldAmount: number, 
        lineBet: number, 
        freespinCount: number, 
        callback: Function, 
        isFreeSpin: boolean = true
    ): void {
        // 禁用鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(false);

        // 切换模式节点显示状态
        this.freeSpin_Node!.active = isFreeSpin;
        this.lockAndRoll_Node!.active = !isFreeSpin;

        // 初始化弹窗状态 + 重置并播放启动动画
        this.setInitPopup();
        this.startAnimation?.stop();
        this.startAnimation!.currentTime = 0;
        this.startAnimation?.play();

        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);
        this._isFreeSpin = isFreeSpin;

        // 播放对应模式的音效，获取音效时长
        const audioKey = isFreeSpin ? "FreespinResultPopup" : "LNRResultPopup";
        const audioSource = SlotSoundController.Instance().playAudio(audioKey, "FX");
        const audioDuration = audioSource ? audioSource.getDuration() : 0;

        // 显示弹窗并初始化状态变量
        this.node.active = true;
        this._isAutoClose = false;
        this._goldAmount = goldAmount;
        this._fnCallback = callback;

        // 控制分享开关显示（判断是否禁用FB分享）
        this.shareToggle!.node.active = false;//UserInfo.instance().isFBShareDisableTarget() === 0;

        // 计算并显示线注倍数、奖励金额、免费旋转次数
        const betMultiplier = Math.floor(goldAmount / lineBet);
        this.collectButton!.interactable = true;
        this.rewardLabel!.string = CurrencyFormatHelper.formatNumber(goldAmount);
        this.lineBetLabel!.string = `X ${CurrencyFormatHelper.formatNumber(betMultiplier)}`;
        this.freespinCountLabel!.string = freespinCount.toString();

        // 延迟恢复主音量（根据音效时长）
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
     * 点击收集按钮（处理收集/分享逻辑）
     */
    public onClickCollect(): void {
        // 取消所有定时器
        this.unscheduleAllCallbacks();
        this.collectButton!.interactable = false;

        // 条件：未禁用FB分享 + 分享开关勾选 + 非自动关闭 → 执行对应模式的FB分享
        const isShareEnabled = false;//UserInfo.instance().isFBShareDisableTarget() === 0;
        if (isShareEnabled && this.shareToggle!.isChecked && !this._isAutoClose) {
            // if (this.freeSpin_Node!.active) {
            //     // FreeSpin模式：获取FreeSpin分享信息
            //     UserInfo.instance().facebookShare(
            //         GameResultPopup.getFreespinShareInfo(this._goldAmount),
            //         () => this.endProcess()
            //     );
            // } else {
            //     // LockAndRoll模式：获取LockAndRoll分享信息
            //     UserInfo.instance().facebookShare(
            //         GameResultPopup.getLockAndRollShareInfo(this._goldAmount),
            //         () => this.endProcess()
            //     );
            // }
        }
        // 其他情况：直接结束流程
        else {
            this.endProcess();
        }
    }

    /**
     * 结束流程（隐藏弹窗+恢复状态+执行回调）
     */
    public endProcess(): void {
        // 停止对应模式的音效
        const audioKey = this._isFreeSpin ? "FreespinResultPopup" : "LNRResultPopup";
        SlotSoundController.Instance().stopAudio(audioKey, "FX");

        // 重置临时调整的主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 隐藏弹窗 + 恢复鼠标拖拽事件
        this.node.active = false;
        SlotManager.Instance.setMouseDragEventFlag(true);

        // 执行回调（检查回调有效性）
        if (this._fnCallback) {
            this._fnCallback();
        }
    }
}