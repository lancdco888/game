const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import CommonServer from "../Network/CommonServer";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import SDefine from "../global_utility/SDefine";
import GameCommonSound from "../GameCommonSound";
import UserInfo from "../User/UserInfo";
import MessageRoutingManager from "../message/MessageRoutingManager";
import TSUtility from "../global_utility/TSUtility";
import CenturionCliqueManager from "../manager/CenturionCliqueManager";

@ccclass
export default class CenturionCliqueInvitePopup extends DialogBase {
    // ===================== 序列化绑定节点属性 原数据完整保留 =====================
    @property(cc.Button)
    private btnCheckBenefits: cc.Button = null;

    @property(cc.Label)
    private lblUserName: cc.Label = null;

    @property(cc.Label)
    private lblExpiredDate: cc.Label = null;

    // ===================== 私有成员变量 原数据完整保留 =====================
    private _uidInboxMessage: string = "";

    // ===================== 生命周期 - 弹窗加载初始化 =====================
    public onLoad(): void {
        this.initDailogBase();
        this.btnCheckBenefits.node.on(cc.Node.EventType.TOUCH_END, this.onCheckBenefits.bind(this));
    }

    // ===================== 静态核心方法 - 加载弹窗预制体 逻辑完全一致 =====================
    public static getPopup(callback: Function): void {
        const popupPath: string = "Service/01_Content/CenturionClique/CenturionClique_Invite";
        if (callback != null) {
            PopupManager.Instance().showDisplayProgress(true);
        }

        cc.loader.loadRes(popupPath, (error, prefab) => {
            if (callback != null) {
                PopupManager.Instance().showDisplayProgress(false);
            }

            if (error) {
                const loadError = new Error(`cc.loader.loadRes fail ${popupPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, loadError));
                if (callback) callback(error, null);
                return;
            }

            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(CenturionCliqueInvitePopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    // ===================== 按钮点击事件 - 领取福利关闭弹窗 =====================
    private onCheckBenefits(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    // ===================== 弹窗打开逻辑 初始化数据赋值 原逻辑一字不差 =====================
    public openPopup(inboxMsgData: any): CenturionCliqueInvitePopup {
        GameCommonSound.playFxOnce("pop_etc");
        super._open(cc.fadeIn(0.3));
        
        this._uidInboxMessage = inboxMsgData.message.mUid;
        const expireDate = new Date(1000 * inboxMsgData.message.expireDate);
        
        if (TSUtility.isValid(this.lblExpiredDate)) {
            this.lblExpiredDate.string = `${expireDate.getDate()}/${expireDate.getMonth() + 1}/${expireDate.getFullYear() % 100}`;
        }

        if (TSUtility.isValid(this.lblUserName) && TSUtility.isValid(UserInfo.instance().getUserName())) {
            this.lblUserName.string = UserInfo.instance().getUserName();
        }
        return this;
    }

    // ===================== 弹窗关闭核心逻辑 【异步网络请求+数据刷新+消息派发】完整保留 =====================
    public close(): void {
        if (this.isStateClose()) return;
        this.setState(DialogState.Close);

        if (this._uidInboxMessage !== "") {
            PopupManager.Instance().showDisplayProgress(true);
            CommonServer.Instance().requestAcceptInboxMessageMulti(
                UserInfo.instance().getUid(),
                UserInfo.instance().getAccessToken(),
                [this._uidInboxMessage],
                async (response) => {
                    PopupManager.Instance().showDisplayProgress(false);
                    if (CommonServer.isServerResponseError(response)) {
                        this._close(null);
                        return;
                    }

                    // 处理服务端返回数据 更新本地缓存
                    const changeResult = UserInfo.instance().getServerChangeResult(response);
                    // 遍历道具历史 校验特殊英雄道具 (原逻辑保留 无修改)
                    for (let i = 0; i < changeResult.itemHist.length && changeResult.itemHist[i].itemId !== SDefine.I_SPECIAL_HERO; ++i);
                    
                    UserInfo.instance().applyChangeResult(changeResult);
                    await UserInfo.instance().asyncRefreshHeroInfo();

                    // 派发刷新消息 + 重启过期定时器
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_CENTURION_CLIQUE);
                    CenturionCliqueManager.Instance().setSchedulerCheckExpireCenturionCliqueItem();
                    CenturionCliqueManager.Instance().setSchedulerCheckExpireCenturionCliqueHero();
                    
                    this._close(null);
                }
            );
            this._uidInboxMessage = "";
        } else {
            this._close(null);
        }
    }
}