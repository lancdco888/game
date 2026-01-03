const { ccclass, property } = cc._decorator;

import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import GameCommonSound from "../GameCommonSound";
import PopupManager from "../manager/PopupManager";
import DialogBase, { DialogState } from "../DialogBase";
import CoinToTargetEffect from "../Popup/CoinToTargetEffect";
import UserInfo from "../User/UserInfo";
import LocalStorageManager from "../manager/LocalStorageManager";
import SlotDataDefine, { FBShareInfo } from "../slot_common/SlotDataDefine";
import MultiNodeActivator from "../Slot/MultiNodeActivator";
// import Instant_ShareiMG from "../Instant/Instant_ShareiMG";
import TSUtility from "../global_utility/TSUtility";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import { Utility } from "../global_utility/Utility";

// 弹窗类型枚举 - 完整保留原JS值
export enum BingoResultType {
    OneBingo = 0,
    MultiBingo = 1
}

// ========== 内部子组件：单Bingo结果面板 ==========
@ccclass('OneBingoResult')
export class OneBingoResult extends cc.Component {
    @property(cc.Button)
    public closeBtn: cc.Button = null;

    @property(cc.Button)
    public collectBtn: cc.Button = null;

    @property(cc.Button)
    public instant_CollectBtn: cc.Button = null;

    @property(cc.Label)
    public rewardLabel: cc.Label = null;

    @property(cc.Animation)
    public titleAni: cc.Animation = null;

    @property(cc.Label)
    public callCntLabel: cc.Label = null;

    @property(cc.Toggle)
    public shareToggle: cc.Toggle = null;

    @property(cc.Node)
    public callsNode: cc.Node = null;
}

// ========== 内部子组件：多Bingo结果面板 ==========
@ccclass('MultiBingoResult')
export class MultiBingoResult extends cc.Component {
    @property(cc.Button)
    public closeBtn: cc.Button = null;

    @property(cc.Button)
    public collectBtn: cc.Button = null;

    @property(cc.Button)
    public instant_CollectBtn: cc.Button = null;

    @property(cc.Label)
    public rewardLabel: cc.Label = null;

    @property(cc.Animation)
    public titleAni: cc.Animation = null;

    @property(cc.Label)
    public bingoCntLabel: cc.Label = null;

    @property(cc.Label)
    public callCntLabel: cc.Label = null;

    @property(cc.Toggle)
    public shareToggle: cc.Toggle = null;

    @property(cc.Node)
    public callsNode: cc.Node = null;
}

// ========== 主弹窗类 ==========
@ccclass('BingoResultPopup')
export default class BingoResultPopup extends DialogBase {
    @property([cc.Node])
    public rewardPopups: cc.Node[] = [];

    @property(cc.Node)
    public prizeBlastIcon: cc.Node = null;

    @property(MultiNodeActivator)
    public bingoExtraCoinIcon: MultiNodeActivator = null;

    @property(OneBingoResult)
    public oneBingoResult: OneBingoResult = null;

    @property(MultiBingoResult)
    public multiBingoResult: MultiBingoResult = null;

    // 私有成员变量
    private _listNameShareImage: string[] = [
        "service-bingo-1-230727.jpg", "service-bingo-2-230727.jpg", "service-bingo-3-230727.jpg",
        "service-bingo-4-230727.jpg", "service-bingo-5-230727.jpg", "service-bingo-6-230727.jpg"
    ];
    private _curCollectNode: cc.Node = null;
    private _startCoin: number = 0;
    private _rewardCoin: number = 0;
    private _endCoin: number = 0;
    private _bingoCnt: number = 0;
    private _callCnt: number = 0;
    private _shareToggle: cc.Toggle = null;
    private _normal_collectBtn: cc.Button = null;
    private _instant_collectBtn: cc.Button = null;
    private _closeBtn: cc.Button = null;
    private _isEnableShareasync: boolean = false;

    // ===================== 静态对外加载方法 =====================
    public static getPopup(callBack: Function) {
        PopupManager.Instance().showDisplayProgress(true);
        cc.loader.loadRes("Service/01_Content/Bingo/Bingo_RewardsPopUp", (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                const error = new Error("cc.loader.loadRes fail BingoResultPopup: %s".format(JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callBack(err, null);
                return;
            }
            const popupCom = cc.instantiate(prefab).getComponent(BingoResultPopup);
            callBack(null, popupCom);
        });
    }

    // ===================== 生命周期 =====================
    onLoad() {
        this.initDailogBase();

        // 绑定按钮点击事件
        this.oneBingoResult.closeBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResultPopup", "onClickClose", ""));
        this.oneBingoResult.collectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResultPopup", "onClickClose", ""));
        this.oneBingoResult.instant_CollectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResultPopup", "onClickInstantCollect", ""));
        
        this.multiBingoResult.closeBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResultPopup", "onClickClose", ""));
        this.multiBingoResult.collectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResultPopup", "onClickClose", ""));
        this.multiBingoResult.instant_CollectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResultPopup", "onClickInstantCollect", ""));

        // FB小游戏 分享能力检测
        if (Utility.isFacebookInstant()) {
            // const supportAPIs = FBInstant.getSupportedAPIs();
            // this._isEnableShareasync = this.contains(supportAPIs, "shareAsync");
            // this._isEnableShareasync ? cc.log("Can Use shareAsync") : cc.log("Can't Use shareAsync");
        }
    }

    // 数组包含判断 - 保留原JS逻辑
    private contains(arr: any[], val: any): boolean {
        for (let i = arr.length; i--;) {
            if (arr[i] === val) return true;
        }
        return false;
    }

    // ===================== 核心打开方法 =====================
    public open(bingoCnt: number, callCnt: number, startCoin: number, rewardCoin: number, endCoin: number, isPrizeBlast: boolean) {
        const self = this;
        // 标记完成Bingo
        ServerStorageManager.save(StorageKeyType.COMPLETE_BINGO, true);

        // 赋值奖励数据
        this._startCoin = startCoin;
        this._endCoin = endCoin;
        this._rewardCoin = rewardCoin;
        this._bingoCnt = bingoCnt;
        this._callCnt = callCnt;

        // 弹窗基础打开
        this._open(null, true, () => {
            // 单Bingo/多Bingo 弹窗切换
            bingoCnt === 1 ? self.openOneBingoReward() : self.openMultiBingoReward();
            
            // 分享开关显隐控制
            self._shareToggle.node.active = (!UserInfo.instance().isFBShareDisableTarget());
            // 非游客用户 恢复分享勾选状态
            if (!UserInfo.instance().isGuestUser()) {
                const sysInfo = LocalStorageManager.getLocalSystemInfo();
                // self._shareToggle.isChecked = sysInfo.shareOnOff;
            }

            // FB小游戏 按钮显隐适配
            self._normal_collectBtn.node.active = (!Utility.isFacebookInstant());
            self._instant_collectBtn.node.active = (!Utility.isFacebookInstant());
            self._closeBtn.node.active = (Utility.isFacebookInstant());

            // 奖励爆炸图标显隐
            self.prizeBlastIcon.active = isPrizeBlast;
            // 多Bingo额外金币特效
            if (bingoCnt >= 2) {
                self.bingoExtraCoinIcon.node.active = true;
                self.bingoExtraCoinIcon.playEffect(bingoCnt - 2);
            } else {
                self.bingoExtraCoinIcon.node.active = false;
            }
        });
    }

    // 切换激活弹窗
    private _setActivePopup(index: number) {
        for (let i = 0; i < this.rewardPopups.length; ++i) {
            this.rewardPopups[i].active = (i === index);
        }
    }

    // 打开单Bingo奖励弹窗
    private openOneBingoReward() {
        const self = this;
        this._setActivePopup(BingoResultType.OneBingo);
        // 赋值奖励数据
        this.oneBingoResult.rewardLabel.string = CurrencyFormatHelper.formatNumber(this._rewardCoin);
        this.oneBingoResult.callCntLabel.string = this._callCnt.toString();
        this._curCollectNode = this.oneBingoResult.collectBtn.node;

        // 标题动画播放
        this.oneBingoResult.titleAni.play("Popup_Reward_Txt_Open_Fx");
        this.scheduleOnce(() => {
            self.oneBingoResult.titleAni.play("Popup_Reward_Idle_Txt_Fx");
        }, this.oneBingoResult.titleAni.currentClip.duration);

        // 通话次数节点显隐
        this.oneBingoResult.callsNode.active = (this._callCnt > 0);

        // 赋值按钮/分享开关引用
        this._shareToggle = this.oneBingoResult.shareToggle;
        this._normal_collectBtn = this.oneBingoResult.collectBtn;
        this._instant_collectBtn = this.oneBingoResult.instant_CollectBtn;
        this._closeBtn = this.oneBingoResult.closeBtn;
    }

    // 打开多Bingo奖励弹窗
    private openMultiBingoReward() {
        const self = this;
        this._setActivePopup(BingoResultType.MultiBingo);
        // 赋值奖励数据
        this.multiBingoResult.rewardLabel.string = CurrencyFormatHelper.formatNumber(this._rewardCoin);
        this.multiBingoResult.bingoCntLabel.string = this._bingoCnt.toString();
        this.multiBingoResult.callCntLabel.string = this._callCnt.toString();
        this._curCollectNode = this.multiBingoResult.collectBtn.node;

        // 标题动画播放
        this.multiBingoResult.titleAni.play("Popup_Reward_Txt_Open_Fx");
        this.scheduleOnce(() => {
            self.multiBingoResult.titleAni.play("Popup_Reward_Idle_Txt_Fx");
        }, this.multiBingoResult.titleAni.currentClip.duration);

        // 通话次数节点显隐
        this.multiBingoResult.callsNode.active = (this._callCnt > 0);

        // 赋值按钮/分享开关引用
        this._shareToggle = this.multiBingoResult.shareToggle;
        this._normal_collectBtn = this.multiBingoResult.collectBtn;
        this._instant_collectBtn = this.multiBingoResult.instant_CollectBtn;
        this._closeBtn = this.multiBingoResult.closeBtn;
    }

    // 获取当前收集按钮节点
    public getCurrentCollectNode(): cc.Node {
        return this._curCollectNode;
    }

    // ===================== 按钮点击事件 =====================
    public onClickClose() {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    public onClickInstantCollect() {
        const self = this;
        GameCommonSound.playFxOnce("btn_etc");
        
        // FB小游戏 分享截图逻辑
        if (this._isEnableShareasync) {
            // Instant_ShareiMG.getDonwloadImage_Base64(async (err, shareImg) => {
            //     const imgBase64 = await shareImg.TakeDownImgScreenShot(TSUtility.getShareServerAddress() + self.getFBSharInfo().subInfo.img);
            //     // FBInstant.shareAsync({
            //     //     image: imgBase64,
            //     //     text: "The BIG Win Slot Machines are ready.",
            //     //     data: { hrv_source: "FBInstant_Share" }
            //     // }).then(() => {}).catch((e) => { cc.log(e.message) });
            // });
        }
        this.close();
    }

    // 清空按钮事件+禁用按钮 防止重复点击
    public clear() {
        this.oneBingoResult.closeBtn.clickEvents = [];
        this.oneBingoResult.collectBtn.clickEvents = [];
        this.multiBingoResult.closeBtn.clickEvents = [];
        this.multiBingoResult.collectBtn.clickEvents = [];

        this.oneBingoResult.closeBtn.enabled = false;
        this.oneBingoResult.collectBtn.enabled = false;
        this.multiBingoResult.closeBtn.enabled = false;
        this.multiBingoResult.collectBtn.enabled = false;
    }

    // ===================== 核心关闭方法 (含金币动画+分享逻辑) =====================
    public close() {
        const self = this;
        if (this.isStateClose()) return;

        this.setState(DialogState.Close);
        this.clear();

        // 播放金币飞入动画
        const collectNode = this.getCurrentCollectNode();
        CoinToTargetEffect.playEffectToMyCoin(collectNode, this._startCoin, this._endCoin, this._rewardCoin, () => {
            self._close(cc.spawn(cc.fadeOut(0.4), cc.scaleTo(0.4, 0.2, 0.2).easing(cc.easeBackIn())));
        });

        // 分享开关状态保存 + FB分享逻辑
        if (!UserInfo.instance().isFBShareDisableTarget()) {
            // const sysInfo = LocalStorageManager.getLocalSystemInfo();
            // sysInfo.shareOnOff = this._shareToggle.isChecked;
            // sysInfo.saveToStorage();

            // // 勾选分享则执行FB分享
            // if (this._shareToggle.isChecked) {
            //     const shareInfo = this.getFBSharInfo();
            //     if (shareInfo) {
            //         UserInfo.instance().facebookShare(shareInfo, null);
            //     }
            // }
        }
    }

    // 构建FB分享信息
    private getFBSharInfo(): FBShareInfo {
        const shareInfo = new SlotDataDefine.FBShareInfo();
        const randomImgIdx = Math.floor(Math.random() * this._listNameShareImage.length);
        const randomImg = this._listNameShareImage[randomImgIdx];

        shareInfo.subInfo.puid = UserInfo.instance().getUid();
        shareInfo.subInfo.st = "Bingo Win";
        shareInfo.subInfo.sl = "%s".format(UserInfo.instance().getLocation());
        shareInfo.subInfo.ssl = UserInfo.instance().getGameId();
        shareInfo.subInfo.zid = UserInfo.instance().getZoneId();
        shareInfo.subInfo.img = randomImg;
        shareInfo.subInfo.tl = "Bingo! It's all mine.";
        shareInfo.desc = "Bingo! \nI just got a Bingo and collected a gooood bonus! \nStart playing now and collect yours!";

        return shareInfo;
    }
}