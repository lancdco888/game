import SlotSoundController from "../../Slot/SlotSoundController";
import UserInfo from "../../User/UserInfo";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import { FBShareInfo } from "../../slot_common/SlotDataDefine";

const { ccclass, property } = cc._decorator;


/**
 * LuckyBunnyDrop Jackpot奖励弹窗组件
 * 负责Jackpot奖励展示、金额格式化、FB分享、动画/音效控制、自动关闭等逻辑
 */
@ccclass()
export default class JackpotResultPopup_LuckyBunnyDrop extends cc.Component {
    // 遮罩背景节点（阻止底层交互，适配画布大小）
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    // 装饰节点（适配画布大小）
    @property(cc.Node)
    public decoNode: cc.Node | null = null;

    // 弹窗根节点
    @property(cc.Node)
    public rootNode: cc.Node | null = null;

    // 金币金额显示标签
    @property(cc.Label)
    public goldAmountLabel: cc.Label | null = null;

    // 收集按钮
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    // 分享开关
    @property(cc.Toggle)
    public shareToggle: cc.Toggle | null = null;

    // 标题节点数组（对应不同Jackpot类型：mini/minor/major/mega/grand）
    @property([cc.Node])
    public title_Nodes: cc.Node[] = [];

    // 需要初始化透明度的节点数组
    @property([cc.Node])
    public opacity_Nodes: cc.Node[] = [];

    // 需要初始化缩放的节点数组
    @property([cc.Node])
    public scale_Nodes: cc.Node[] = [];

    // 弹窗启动动画组件
    @property(cc.Animation)
    public startAnimation: cc.Animation | any = null;

    // 私有变量：Jackpot金额
    private _goldAmount: number = 0;
    // 私有变量：弹窗关闭后的回调函数
    private _fnCallback: Function | null = null;
    // 私有变量：是否自动关闭
    private _isAutoClose: boolean = false;
    // 私有变量：Jackpot类型（0=mini,1=minor,2=major,3=mega,4=grand）
    private _jackpotType: number = 0;

    /**
     * 组件加载时执行（Cocos生命周期）
     * 适配遮罩背景和装饰节点大小 + 添加FB分享存储组件
     */
    public onLoad(): void {
        // 适配画布大小
        if (this.blockingBG && this.decoNode) {
            const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
            if (canvasComp?.node) {
                const canvasSize = canvasComp.node.getContentSize();
                this.blockingBG.setContentSize(canvasSize);
                this.decoNode.setContentSize(canvasSize);
            }
        }

        // 为分享开关添加FB分享标记存储组件
        // if (this.shareToggle) {
        //     this.shareToggle.node.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    /**
     * 初始化弹窗状态（重置节点缩放和透明度）
     */
    public setInitPopup(): void {
        // 重置缩放节点为0
        for (const node of this.scale_Nodes) {
            node.scale = 0;
        }

        // 重置透明度节点为1（原JS中opacity=1，对应255，此处保留原逻辑）
        for (const node of this.opacity_Nodes) {
            node.opacity = 1;
        }
    }

    /**
     * 打开Jackpot奖励弹窗
     * @param goldAmount Jackpot金额
     * @param jackpotType Jackpot类型（1=mini,2=minor,3=major,4=mega,5=grand）
     * @param callback 弹窗关闭后的回调函数
     */
    public open(goldAmount: number, jackpotType: number, callback: Function): void {
        // 禁用鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(false);
        
        // 初始化弹窗状态 + 重置并播放启动动画
        this.setInitPopup();
        this.startAnimation.stop();
        this.startAnimation.currentTime = 0;
        this.startAnimation.play();

        // 播放Jackpot弹窗音效，根据音效时长调整主音量
        const audioSource = SlotSoundController.Instance().playAudio("JackpotResultPopup", "FX");
        const audioDuration = audioSource ? audioSource.getDuration() : 0;
        SoundManager.Instance().setMainVolumeTemporarily(0);
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 显示对应Jackpot类型的标题节点
        for (let i = 0; i < this.title_Nodes.length; i++) {
            this.title_Nodes[i].active = i === (jackpotType - 1);
        }

        // 显示弹窗
        this.node.active = true;
        this.blockingBG!.active = true;
        this.rootNode!.active = true;

        // 初始化状态变量
        this._isAutoClose = false;
        this._jackpotType = jackpotType - 1; // 转换为0-4的索引
        this.collectButton!.interactable = true;

        // 格式化并显示金额
        if (this.goldAmountLabel) {
            this.goldAmountLabel.string = CurrencyFormatHelper.formatNumber(goldAmount);
        }
        this._goldAmount = goldAmount;
        this._fnCallback = callback;

        // 控制分享开关显示（判断是否禁用FB分享）
        this.shareToggle!.node.active = false;// UserInfo.instance().isFBShareDisableTarget() === 0;

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

        // 条件：未禁用FB分享 + 分享开关勾选 + 非自动关闭 → 执行FB分享
        const isShareEnabled =  false;//UserInfo.instance().isFBShareDisableTarget() === 0;
        if (isShareEnabled && this.shareToggle!.isChecked && !this._isAutoClose) {
            // UserInfo.instance().facebookShare(this.getJackpotShareInfo(), () => {
            //     this.endProcess();
            // });
        }
        // 其他情况：直接结束流程
        else {
            this.endProcess();
        }
    }

    /**
     * 获取Jackpot分享信息（构建FB分享参数）
     * @returns FB分享信息对象
     */
    public getJackpotShareInfo(): FBShareInfo {
        // 选择对应Jackpot类型的分享图片
        let shareImage = "";
        switch (this._jackpotType) {
            case 0: shareImage = "slot-luckybunnydrop-jackpot-mini-20230214.jpg"; break;
            case 1: shareImage = "slot-luckybunnydrop-jackpot-minor-20230214.jpg"; break;
            case 2: shareImage = "slot-luckybunnydrop-jackpot-major-20230214.jpg"; break;
            case 3: shareImage = "slot-luckybunnydrop-jackpot-mega-20230214.jpg"; break;
            case 4: shareImage = "slot-luckybunnydrop-jackpot-grand-20230214.jpg"; break;
        }

        // 选择对应Jackpot类型的分享文案
        let shareDesc = "";
        const formattedAmount = CurrencyFormatHelper.formatNumber(this._goldAmount);
        switch (this._jackpotType) {
            case 0:
                shareDesc = "I just hit a Jackpot of %s coins! \nCome and claim your mega wins here!".format(formattedAmount);
                break;
            case 1:
                shareDesc = "Woot woot!! \nI just hit a HUGE JACKPOT of %s coins! \nCan you get yours?".format(formattedAmount);
                break;
            case 2:
                shareDesc = "Unbelievable! \nI just hit a MAJOR JACKPOT of %s coins! \nTap here and find your jackpots!".format(formattedAmount);
                break;
            case 3:
                shareDesc = "Woah! \nI just got a COLOSSAL JACKPOT %s coins! \nTap now and test your luck!".format(formattedAmount);
                break;
            case 4:
                shareDesc = "I just got %s coins on a GRAND JACKPOT. \nI can't believe my luck! \nI'm in seventh heaven.".format(formattedAmount);
                break;
        }

        // 构建FB分享信息对象
        const shareInfo = new FBShareInfo();
        // shareInfo.subInfo = {
        //     puid: UserInfo.instance().getUid(),
        //     st: "Jackpot",
        //     sl: "",
        //     ssl: UserInfo.instance().getGameId(),
        //     zid: UserInfo.instance().getZoneId(),
        //     img: shareImage,
        //     tl: "I can not believe it!"
        // };
        shareInfo.desc = shareDesc;

        return shareInfo;
    }

    /**
     * 结束流程（隐藏弹窗+恢复状态+执行回调）
     */
    public endProcess(): void {
        // 停止Jackpot弹窗音效
        SlotSoundController.Instance().stopAudio("JackpotResultPopup", "FX");
        
        // 恢复鼠标拖拽事件 + 重置临时调整的主音量
        SlotManager.Instance.setMouseDragEventFlag(true);
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 隐藏弹窗
        this.node.active = false;

        // 执行回调（检查回调有效性）
        if (TSUtility.isValid(this._fnCallback)) {
            this._fnCallback!();
        }
    }
}