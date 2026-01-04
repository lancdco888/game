const { ccclass, property } = cc._decorator;

import AdsManager, { PlacementID_Type } from "./../Utility/AdsManager";
import Analytics from "../Network/Analytics";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import AdsManager2 from "../Utility/AdsManager";
// import InstantsRewardPopoup from "../Popup/InstantsRewardPopoup";
import CommonServer from "../Network/CommonServer";
import UserInfo from "../User/UserInfo";
import CoinToTargetEffect from "../Popup/CoinToTargetEffect";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
// import Utility from "../Utility/Utility";

@ccclass
export default class BingoRemainGameCollectUI extends cc.Component {
    @property(cc.Button)
    public showCollectBtn: cc.Button = null;

    @property(cc.Node)
    public collectNode: cc.Node = null;

    @property(cc.Button)
    public closeCollectBtn: cc.Button = null;

    @property(cc.Button)
    public collectBtn: cc.Button = null;

    @property(cc.Button)
    public ad_CollectBtn: cc.Button = null;

    private _boardNo: number = 0;
    private _completeFunc: Function = null;
    private _isADCollect: boolean = false;

    start() {
        this.showCollectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoRemainGameCollectUI", "onClickShowCollect", ""));
        this.closeCollectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoRemainGameCollectUI", "onClickCloseCollectBtn", ""));
        this.ad_CollectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoRemainGameCollectUI", "onClickADCollect", ""));
    }

    showCollectRoot(boardNo: number, targetNode: cc.Node, completeFunc: Function) {
        this.node.active = true;
        this.collectNode.active = false;
        this._boardNo = boardNo;
        this._completeFunc = completeFunc;
        
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(worldPos));

        // const purchaseCnt = UserInfo.instance().getPurchaseInfo().cntIn30Days;
        // if (!Utility.isMobileGame() && !Utility.isFacebookInstant() || !AdsManager2.Instance().isReadyRewardedAD() || purchaseCnt !==0) {
        //     this.showCollectBtn.node.active = true;
        //     this.ad_CollectBtn.node.active = false;
        // } else {
        //     AdsManager2.Instance().ADLog_RewardedADShowUI(PlacementID_Type.BINGO_INSTANTLY);
        //     this.showCollectBtn.node.active = false;
        //     this.ad_CollectBtn.node.active = true;
        //     this._isADCollect = false;
        // }
    }

    hideCollectRoot() {
        this.node.active = false;
    }

    onClickADCollect() {
        const self = this;
        if (!this._isADCollect) {
            this._isADCollect = true;
            GameCommonSound.playFxOnce("btn_etc");
            PopupManager.Instance().showDisplayProgress(true);

            const adType = PlacementID_Type.BINGO_INSTANTLY;
            const adNum = AdsManager2.Instance().getRewardVideoADNumber(adType);
            Analytics.clickADVideo(adNum);

            AdsManager2.Instance().RewardedVideoAdplay(adType, function() {
                AdsManager2.Instance().ADLog_RewardedADRewarded(adType);
                CommonServer.Instance().requestBingoRemainGameCollect(
                    UserInfo.instance().getUid(),
                    UserInfo.instance().getAccessToken(),
                    self._boardNo,
                    function(resData) {
                        PopupManager.Instance().showDisplayProgress(false);
                        if (!CommonServer.isServerResponseError(resData) && cc.isValid(self)) {
                            // const changeResult = UserInfo.instance().getServerChangeResult(resData);
                            // const changeCoin = changeResult.getTotalChangeCoin();
                            // const oldCoin = UserInfo.instance().getTotalCoin();

                            PopupManager.Instance().showBlockingBG(true);
                            // InstantsRewardPopoup.getPopup(function(isError, popup) {
                            //     PopupManager.Instance().showDisplayProgress(false);
                            //     if (!isError) {
                            //         popup.open();
                            //         popup.setRewardAmount(changeCoin, 0, 0);
                            //         popup.setCollectCallback(function() {
                            //             UserInfo.instance().applyChangeResult(changeResult);
                            //             const newCoin = UserInfo.instance().getTotalCoin();
                            //             CoinToTargetEffect.playEffectToMyCoin(popup.collectButton.node, oldCoin, newCoin, changeCoin, function() {
                            //                 if (TSUtility.isValid(self) && TSUtility.isValid(self._completeFunc)) {
                            //                     self._completeFunc();
                            //                 }
                            //                 if (TSUtility.isValid(popup)) {
                            //                     popup.close();
                            //                 }
                            //             });
                            //         });
                            //     }
                            // });
                            self._isADCollect = false;
                        }
                    }, true
                );
            }, function() {
                PopupManager.Instance().showDisplayProgress(false);
                if (AdsManager2.Instance().isReadyRewardedAD()) {
                    self.showCollectBtn.node.active = false;
                    self.ad_CollectBtn.node.active = true;
                    self._isADCollect = false;
                } else {
                    self.showCollectBtn.node.active = true;
                    self.ad_CollectBtn.node.active = false;
                }
            });
        }
    }

    onClickShowCollect() {
        GameCommonSound.playFxOnce("btn_etc");
        this.collectNode.active = true;
    }

    onClickCloseCollectBtn() {
        GameCommonSound.playFxOnce("btn_etc");
        this.collectNode.active = false;
    }
}