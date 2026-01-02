const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import PopupManager from "../manager/PopupManager";
import CommonServer from "../Network/CommonServer";
import UserInfo from "../User/UserInfo";
import SoundManager from "../manager/SoundManager";
import DialogBase, { DialogState } from "../DialogBase";
import BingoManager_New from "./BingoManager_New";
import MessageRoutingManager from "../message/MessageRoutingManager";
import ADTargetManager from "../ServiceInfo/ADTargetManager";
import AdsManager, { PlacementID_InterstitalType } from "../Utility/AdsManager";
import ServiceInfoManager from "../ServiceInfoManager";
import ADFreeOfferPopup from "../Popup/ADFreeOfferPopup";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import LobbyScene from "../LobbyScene";

/**
 * Bingo游戏弹窗 核心弹窗类
 * 继承DialogBase弹窗基类，实现宾果游戏的弹窗加载、初始化、广告、音效、关闭等完整逻辑
 */
@ccclass
export default class BingoPopup extends DialogBase {
    // ===================== 序列化绑定资源 与原文件完全一致 补全@property精准注解 =====================
    @property({ type: cc.AudioClip, tooltip: "Bingo弹窗背景音乐" })
    public mainBGM: cc.AudioClip = null;

    // ===================== 私有成员变量 补全类型注解 与原初始化值一致 =====================
    private bingoManager: BingoManager_New = null;
    private _prevMainBGM: cc.AudioClip = null;

    // ===================== 静态公有核心方法 - Bingo弹窗全局打开入口 项目唯一调用方式 完整保留原逻辑 =====================
    public static openPopup(serverRewardData: any, openCallback?: Function, closeCallback?: Function): void {
        PopupManager.Instance().showDisplayProgress(true);
        // 加载Bingo弹窗预制体资源
        cc.loader.loadRes("Service/01_Content/Bingo/BingoPopup_2021", (err: Error, prefab: cc.Prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                DialogBase.exceptionLogOnResLoad("cc.loader.loadRes fail BingoPopup: %s".format(JSON.stringify(err)));
                return;
            }

            // 实例化弹窗预制体
            const popupNode = cc.instantiate(prefab);
            const bingoPopup = popupNode.getComponent(BingoPopup);
            bingoPopup.initBingoPopup();
            popupNode.active = false;

            // 请求用户购买信息
            PopupManager.Instance().showDisplayProgress(true);
            CommonServer.Instance().requestPurchaseInfo(
                UserInfo.instance().getUid(),
                UserInfo.instance().getAccessToken(),
                (purchaseRes: any) => {
                    PopupManager.Instance().showDisplayProgress(false);
                    if (CommonServer.isServerResponseError(purchaseRes)) return;

                    // 初始化用户购买信息
                    UserInfo.instance()._userInfo.userPurchaseInfo.initUserPurchaseInfo(purchaseRes.userPurchaseInfo);
                    // 请求Bingo游戏核心数据
                    CommonServer.Instance().requestBingoGameInfo(
                        UserInfo.instance().getUid(),
                        UserInfo.instance().getAccessToken(),
                        (bingoRes: any) => {
                            PopupManager.Instance().showDisplayProgress(false);
                            if (CommonServer.isServerResponseError(bingoRes)) return;

                            // 缓存Bingo游戏信息到全局
                            ServiceInfoManager.INFO_BINGO = bingoRes.bingoInfo;
                            // 设置关闭回调 + 打开弹窗
                            bingoPopup.setCloseCallback(closeCallback);
                            bingoPopup.open(bingoRes, serverRewardData);
                            // 执行弹窗打开后的回调
                            if (openCallback) {
                                bingoPopup.scheduleOnce(() => { openCallback(); }, 0.15);
                            }
                        }
                    );
                }
            );
        });
    }

    // ===================== 实例核心方法 与原JS逻辑一字不差 完整保留 =====================
    /** 初始化Bingo弹窗 绑定游戏管理器组件 */
    public initBingoPopup(): void {
        this.bingoManager = this.node.getComponent(BingoManager_New);
    }

    /** 弹窗生命周期 - 加载时初始化弹窗基类 */
    public onLoad(): void {
        this.initDailogBase();
    }

    /** 弹窗生命周期 - 销毁时空实现 完整保留原方法占位 */
    public onDestroy(): void { }

    /**
     * 弹窗核心打开方法 - 执行显隐动画+初始化游戏+切换BGM+广告逻辑
     * @param bingoData Bingo游戏服务器数据
     * @param rewardData 领取奖励的服务器返回数据
     */
    public open(bingoData: any, rewardData: any): BingoPopup {
        const self = this;
        // 标记Bingo弹窗为打开状态
        ServiceInfoManager.instance.setBingoPopupOpen(true);
        this.rootNode.opacity = 150;

        // 执行弹窗淡入动画 0.15秒
        this._open(cc.fadeIn(0.15), true, () => {
            // 初始化Bingo游戏管理器核心数据
            self.bingoManager.initBingoManager(bingoData.bingoInfo, rewardData);

            // 场景判断：大厅场景 / 其他场景 区分处理BGM
            if (UserInfo.instance().getCurrentSceneMode() == SDefine.Lobby) {
                const lobbyScene = LobbyScene.instance;
                if (TSUtility.isValid(lobbyScene)) {
                    lobbyScene.isOverrideBGM = true;
                    SoundManager.Instance().playBGM(self.mainBGM);
                }
            } else {
                // 缓存上一个BGM 弹窗关闭时恢复
                self._prevMainBGM = SoundManager.Instance().getMainBGMClip();
                SoundManager.Instance().playBGM(self.mainBGM);
            }

            // ✅ 广告核心逻辑 完整保留：插屏广告播放+埋点+免费弹窗触发
            if (AdsManager.Instance().isUseable()) {
                // 广告埋点上报
                AdsManager.Instance().ADLog_InterstitialShowUI(PlacementID_InterstitalType.LOBBYTOBINGO);
                // 判断是否启用插屏广告 并播放广告
                if (ADTargetManager.instance().enableInterstitialAD()) {
                    AdsManager.Instance().InterstitialAdplay(
                        PlacementID_InterstitalType.LOBBYTOBINGO,
                        // 广告播放成功回调
                        () => {
                            ServiceInfoManager.instance.addInterstitialADPlayCount();
                            if (ServiceInfoManager.instance.getShowADSFreePopup()) {
                                PopupManager.Instance().showDisplayProgress(true);
                                ADFreeOfferPopup.getPopup(
                                    ServiceInfoManager.NUMBER_ADS_FREE_POPUP_KIND,
                                    (isErr: Error, popup: ADFreeOfferPopup) => {
                                        PopupManager.Instance().showDisplayProgress(false);
                                        if (!isErr) popup.open();
                                    }
                                );
                            }
                        },
                        // 广告播放失败回调
                        () => {
                            if (!TSUtility.isLiveService()) {
                                ServiceInfoManager.instance.addInterstitialADPlayCount();
                                if (ServiceInfoManager.instance.getShowADSFreePopup()) {
                                    PopupManager.Instance().showDisplayProgress(true);
                                    ADFreeOfferPopup.getPopup(
                                        ServiceInfoManager.NUMBER_ADS_FREE_POPUP_KIND,
                                        (isErr: Error, popup: ADFreeOfferPopup) => {
                                            PopupManager.Instance().showDisplayProgress(false);
                                            if (!isErr) popup.open();
                                        }
                                    );
                                }
                            }
                        }
                    );
                }
            }
        });

        return this;
    }

    /** 弹窗返回按钮处理 - 判断是否有遮罩层 有则拦截返回 无则执行关闭流程 */
    public onBackBtnProcess(): boolean {
        return (this.bingoManager.bingoUIBlockingNode.active) || this.closeBackBtnProcess();
    }

    /** 弹窗关闭核心流程 - 恢复BGM+标记弹窗状态+移除消息监听+广告逻辑 */
    public closeFlow(): void {
        // 恢复背景音乐：大厅场景取消覆盖 / 其他场景恢复上一个BGM
        if (UserInfo.instance().getCurrentSceneMode() == SDefine.Lobby) {
            const lobbyScene = LobbyScene.instance;
            if (TSUtility.isValid(lobbyScene)) {
                lobbyScene.isOverrideBGM = false;
            }
        } else {
            if (this._prevMainBGM) SoundManager.Instance().playBGM(this._prevMainBGM);
        }

        // 标记Bingo弹窗为关闭状态
        ServiceInfoManager.instance.setBingoPopupOpen(false);
        // 执行弹窗关闭动画
        this._close(null);

        // ✅ 返回大厅广告逻辑 完整保留：插屏广告播放+埋点+免费弹窗触发
        if (AdsManager.Instance().isUseable()) {
            AdsManager.Instance().ADLog_InterstitialShowUI(PlacementID_InterstitalType.BINGTOLOBBY);
            if (ADTargetManager.instance().enableInterstitialAD()) {
                AdsManager.Instance().InterstitialAdplay(
                    PlacementID_InterstitalType.BINGTOLOBBY,
                    // 广告播放成功回调
                    () => {
                        ServiceInfoManager.instance.addInterstitialADPlayCount();
                        if (ServiceInfoManager.instance.getShowADSFreePopup()) {
                            PopupManager.Instance().showDisplayProgress(true);
                            ADFreeOfferPopup.getPopup(
                                ServiceInfoManager.NUMBER_ADS_FREE_POPUP_KIND,
                                (isErr: Error, popup: ADFreeOfferPopup) => {
                                    PopupManager.Instance().showDisplayProgress(false);
                                    if (!isErr) popup.open();
                                }
                            );
                        }
                    },
                    // 广告播放失败回调
                    () => {
                        if (!TSUtility.isLiveService()) {
                            ServiceInfoManager.instance.addInterstitialADPlayCount();
                            if (ServiceInfoManager.instance.getShowADSFreePopup()) {
                                PopupManager.Instance().showDisplayProgress(true);
                                ADFreeOfferPopup.getPopup(
                                    ServiceInfoManager.NUMBER_ADS_FREE_POPUP_KIND,
                                    (isErr: Error, popup: ADFreeOfferPopup) => {
                                        PopupManager.Instance().showDisplayProgress(false);
                                        if (!isErr) popup.open();
                                    }
                                );
                            }
                        }
                    }
                );
            }
        }

        // 移除当前弹窗的所有全局消息监听 防止内存泄漏
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    /** 弹窗对外关闭方法 - 状态校验+停止音效+请求最新数据+执行关闭流程 */
    public close(): void {
        const self = this;
        if (this.isStateClose()) return;

        // 设置弹窗状态为关闭 清理资源
        this.setState(DialogState.Close);
        this.clear();
        SoundManager.Instance().stopAllFxLoop();

        // 请求最新的Bingo游戏数据 保证数据同步
        CommonServer.Instance().requestBingoGameInfo(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            (bingoRes: any) => {
                PopupManager.Instance().showDisplayProgress(false);
                if (CommonServer.isServerResponseError(bingoRes)) {
                    self.closeFlow();
                } else {
                    // 缓存最新Bingo数据到全局
                    ServiceInfoManager.INFO_BINGO = bingoRes.bingoInfo;
                    self.closeFlow();
                    // 检查是否有后续需要打开的弹窗
                    PopupManager.Instance().checkNextOpenPopup();
                }
            }
        );
    }
}