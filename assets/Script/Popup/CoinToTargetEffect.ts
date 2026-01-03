const { ccclass, property } = cc._decorator;

import PopupManager from "../manager/PopupManager";
import SoundManager from "../manager/SoundManager";
import GameCommonSound from "../GameCommonSound";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
// import MyBankrollInfoPopup from "./MyBankrollInfoPopup";

@ccclass('CoinToTargetEffect')
export default class CoinToTargetEffect extends cc.Component {
    @property(cc.Node)
    public coinTemplate: cc.Node = null;

    @property(cc.Node)
    public coinExplodeEffTemplate: cc.Node = null;

    @property(cc.Node)
    public winExplodeEff: cc.Node = null;

    @property(cc.Node)
    public coinLayer: cc.Node = null;

    @property(cc.Node)
    public particle: cc.Node = null;

    // 静态常量 & 静态对象
    public static MAX_COIN_CNT: number = 10;
    public static coinNodePool: cc.NodePool = null;

    // 私有成员变量
    private coinSpawnInterval: number = 0.1;
    private coinMoveInterval: number = 1.2;
    private _closeCallback: Function = null;

    // ===================== 静态对外调用方法 =====================
    public static playEffectToMyCoinInfo(startNode: cc.Node, animTime: number, targetNode: cc.Node, oldVal: number, newVal: number, addVal: number, callBack: Function) {
        this._playEffectToMyCoinInfo("Bottom", 3, startNode, animTime, oldVal, newVal, addVal, false, callBack);
    }

    public static playEffectToMyCoinInGameInfo(startNode: cc.Node, animTime: number, targetNode: cc.Node, oldVal: number, newVal: number, addVal: number, callBack: Function) {
        this._playEffectToMyCoinInfo("Ingame", 2.8, startNode, animTime, oldVal, newVal, addVal, false, callBack);
    }

    public static playEffectToMyCoinInGameInfo_DisableMoveCoin(startNode: cc.Node, animTime: number, targetNode: cc.Node, oldVal: number, newVal: number, addVal: number, callBack: Function) {
        this._playEffectToMyCoinInfo("Ingame", 2.8, startNode, animTime, oldVal, newVal, addVal, true, callBack);
    }

    public static playEffectToMyCoin(startNode: cc.Node, oldVal: number, newVal: number, addVal: number, callBack: Function) {
        if (UserInfo.instance().getCurrentSceneMode() == SDefine.Lobby) {
            this.playEffectToMyCoinInfo(startNode, 3, startNode, oldVal, newVal, addVal, callBack);
        } else {
            this.playEffectToMyCoinInGameInfo(startNode, 2.8, startNode, oldVal, newVal, addVal, callBack);
        }
    }

    private static _playEffectToMyCoinInfo(sceneType: string, animTime: number, startNode: cc.Node, timeVal: number, oldVal: number, newVal: number, addVal: number, isDisable: boolean, callBack: Function) {
        const isBlocking = PopupManager.Instance().isBlocking();
        PopupManager.Instance().showBlockingBG(true);
        PopupManager.Instance().showDisplayProgress(true);

        if (startNode == null) {
            callBack();
            callBack = null;
            return;
        }

        const startWorldPos = startNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let coinEffect: CoinToTargetEffect = null;
        // let bankrollPopup: MyBankrollInfoPopup = null;
        let isError = false;

        const completeFunc = () => {
            if (!isBlocking) PopupManager.Instance().showBlockingBG(false);
            if (isError) {
                if (callBack) {
                    callBack();
                    callBack = null;
                }
                return;
            }

            // if (bankrollPopup && coinEffect) {
            //     bankrollPopup.open(timeVal, oldVal, addVal, isDisable);
            //     bankrollPopup.playChangeNumber(oldVal, newVal, 1.4, 0.8);
            //     const targetWorldPos = bankrollPopup.effectTargetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            //     coinEffect.open(startWorldPos, targetWorldPos, CoinToTargetEffect.MAX_COIN_CNT, callBack);
            // }
        };

        this.getPopup((err, effect) => {
            if (err) {
                cc.log("CoinToTargetEffect load error, ", JSON.stringify(err));
                PopupManager.Instance().showDisplayProgress(false);
                isError = true;
            } else {
                coinEffect = effect;
            }
            completeFunc();
        });

        // MyBankrollInfoPopup.getPopup((err, popup) => {
        //     if (err) {
        //         cc.log("MyBankrollInfoPopup load error, ", JSON.stringify(err));
        //         PopupManager.Instance().showDisplayProgress(false);
        //         isError = true;
        //     } else {
        //         bankrollPopup = popup;
        //     }
        //     completeFunc();
        // });
    }

    public static playEffectToTarget(startNode: cc.Node, targetNode: cc.Node, coinCnt: number, callBack: Function) {
        if (startNode == null || targetNode == null) {
            callBack();
            callBack = null;
            return;
        }

        const startWorldPos = startNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const targetWorldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);

        this.getPopup((err, effect) => {
            effect.open(startWorldPos, targetWorldPos, coinCnt, callBack);
        });
    }

    public static getPopup(callBack: Function) {
        cc.loader.loadRes("Service/00_Common/CollectEffect/CoinToTargetEffect", (err, prefab) => {
            if (err) {
                const error = new Error("cc.loader.loadRes fail %s: %s".format("CoinToTargetEffect", JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callBack(err, null);
                return;
            }
            const node = cc.instantiate(prefab);
            const effect = node.getComponent(CoinToTargetEffect);
            node.active = false;
            callBack(null, effect);
        });
    }

    public static getCoinNode(template: cc.Node): cc.Node {
        if (this.coinNodePool == null) {
            this.coinNodePool = new cc.NodePool();
            for (let i = 0; i < this.MAX_COIN_CNT; ++i) {
                const coinNode = cc.instantiate(template);
                this.coinNodePool.put(coinNode);
            }
        }
        return this.coinNodePool.size() == 0 ? cc.instantiate(template) : this.coinNodePool.get();
    }

    public static putCoinNode(node: cc.Node) {
        this.coinNodePool.put(node);
    }

    // ===================== 成员方法 =====================
    public open(startWorldPos: cc.Vec2, targetWorldPos: cc.Vec2, coinCnt: number, callBack: Function) {
        const self = this;
        PopupManager.Instance().showDisplayProgress(false);
        if (SoundManager.Instance()) GameCommonSound.playFxOnce("get_coins");
        
        PopupManager.Instance().node.addChild(this.node);
        this.node.active = true;
        this.particle.active = false;
        this._closeCallback = callBack;

        const startNodePos = this.node.convertToNodeSpaceAR(startWorldPos);
        const targetNodePos = this.node.convertToNodeSpaceAR(targetWorldPos);
        const disX = targetNodePos.x - startNodePos.x;
        const disY = targetNodePos.y - startNodePos.y;

        let coinAniFunc = null;
        if (Math.abs(disY) < 100) {
            coinAniFunc = disY > 0 ? this.getCoinAniActionTimeBonusReverse.bind(this) : this.getCoinAniActionTimeBonus.bind(this);
        } else if (Math.abs(disX) < 150) {
            coinAniFunc = disY < 0 ? this.getCoinAniActionTimeBonus2.bind(this) : this.getCoinAniActionTimeBonusReverse.bind(this);
        } else {
            coinAniFunc = this.getCoinAniActionNormal.bind(this);
        }

        this.winExplodeEff.setPosition(startNodePos);

        const createCoin = (index: number) => {
            const coinNode = CoinToTargetEffect.getCoinNode(self.coinTemplate);
            self.coinLayer.addChild(coinNode);
            coinNode.setPosition(startNodePos);

            const coinAni = coinNode.getComponentInChildren(cc.Animation);
            const delayTime = Math.random() * coinAni.defaultClip.duration;
            coinAni.play(coinAni.defaultClip.name, delayTime);
            coinNode.active = false;

            const scaleVal = 0.2 * Math.random() + 0.8;
            coinNode.setScale(scaleVal);

            const coinMoveAction = coinAniFunc(startNodePos, targetNodePos);
            self.node.runAction(cc.targetedAction(coinNode, cc.sequence(
                cc.delayTime(self.coinSpawnInterval * index),
                cc.callFunc(() => {
                    coinNode.active = true;
                    coinNode.scale = 0.7;
                }),
                cc.spawn(coinMoveAction, cc.sequence(
                    cc.scaleTo(self.coinMoveInterval / 2, 1.2),
                    cc.scaleTo(self.coinMoveInterval / 2, 0.8)
                )),
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    coinNode.removeFromParent();
                    CoinToTargetEffect.putCoinNode(coinNode);
                })
            )));

            self.node.runAction(cc.sequence(
                cc.delayTime(self.coinSpawnInterval * index + self.coinMoveInterval),
                cc.callFunc(() => {
                    if (!self.particle.active) {
                        self.particle.active = true;
                        self.particle.setPosition(targetNodePos);
                        self.coinExplodeEffTemplate.active = true;
                        self.coinExplodeEffTemplate.setPosition(targetNodePos);
                    }
                })
            ));
        };

        for (let i = 0; i < coinCnt; ++i) {
            createCoin(i);
        }

        this.coinTemplate.active = false;
        this.coinExplodeEffTemplate.active = false;
        this.scheduleOnce(this.close.bind(this), this.coinSpawnInterval * coinCnt + this.coinMoveInterval);
    }

    public getCoinAniAction(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const disY = targetPos.y - startPos.y;
        const posArr = [];
        posArr.push(startPos);
        posArr.push(cc.v2(startPos.x + 0.5 * disX, startPos.y + 0.15 * disY));
        posArr.push(cc.v2(startPos.x + 0.9 * disX, startPos.y + 0.6 * disY));
        posArr.push(targetPos);
        return cc.catmullRomBy(this.coinMoveInterval, posArr).easing(cc.easeIn(1.2));
    }

    public getCoinAniAction2(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const disY = targetPos.y - startPos.y;
        const targetDis = cc.v2(targetPos);
        targetDis.subSelf(startPos);

        const posArr = [];
        posArr.push(cc.Vec2.ZERO);
        const randX = 20 * Math.random();
        const randY = 20 * Math.random();
        posArr.push(cc.v2(-0.2 * disX + randX, 0.2 * disY + 100 + randY));
        posArr.push(cc.v2(1.1 * disX + randY, 0.6 * disY + 70 + randX));
        posArr.push(targetDis);
        return cc.cardinalSplineBy(this.coinMoveInterval, posArr, 0.1).easing(cc.easeIn(1.2));
    }

    public getCoinAniActionNormal(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const disY = targetPos.y - startPos.y;
        let dir = 1;
        if (disX < 0) dir = -1;

        const targetDis = cc.v2(targetPos);
        targetDis.subSelf(startPos);

        const posArr = [];
        posArr.push(cc.Vec2.ZERO);
        const randX = 20 * Math.random();
        const randY = 20 * Math.random();
        posArr.push(cc.v2(30 * dir + randX, 0.25 * disY + randY));
        posArr.push(cc.v2(disX + -30 * dir + randY, 0.7 * disY + randX));
        posArr.push(targetDis);
        return cc.cardinalSplineBy(this.coinMoveInterval, posArr, 0.1).easing(cc.easeIn(1.2));
    }

    public getCoinAniActionNormal2(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const disY = targetPos.y - startPos.y;
        let dir = 1;
        if (disX < 0) dir = -1;

        const targetDis = cc.v2(targetPos);
        targetDis.subSelf(startPos);

        const posArr = [];
        posArr.push(cc.Vec2.ZERO);
        const randX = 20 * Math.random();
        const randY = 20 * Math.random();
        posArr.push(cc.v2(90 * dir + randX, 0.25 * disY + randY));
        posArr.push(cc.v2(disX + -50 * dir + randY, 0.8 * disY + randX));
        posArr.push(targetDis);
        return cc.cardinalSplineBy(this.coinMoveInterval, posArr, 0.1).easing(cc.easeIn(1.2));
    }

    public getCoinAniActionTimeBonus(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const targetDis = cc.v2(targetPos);
        targetDis.subSelf(startPos);

        const posArr = [];
        posArr.push(cc.Vec2.ZERO);
        posArr.push(cc.v2(-0.2 * disX, 100));
        posArr.push(cc.v2(0.7 * disX, 60));
        posArr.push(targetDis);
        return cc.cardinalSplineBy(this.coinMoveInterval, posArr, 0.1).easing(cc.easeIn(1.2));
    }

    public getCoinAniActionTimeBonusReverse(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const targetDis = cc.v2(targetPos);
        targetDis.subSelf(startPos);

        const posArr = [];
        posArr.push(cc.Vec2.ZERO);
        posArr.push(cc.v2(-0.2 * disX, -100));
        posArr.push(cc.v2(0.7 * disX, -60));
        posArr.push(targetDis);
        return cc.cardinalSplineBy(this.coinMoveInterval, posArr, 0.1).easing(cc.easeIn(1.2));
    }

    public getCoinAniActionTimeBonus2(startPos: cc.Vec2, targetPos: cc.Vec2) {
        const disX = targetPos.x - startPos.x;
        const targetDis = cc.v2(targetPos);
        targetDis.subSelf(startPos);

        const posArr = [];
        posArr.push(cc.Vec2.ZERO);
        posArr.push(cc.v2(-0.3 * disX, 120));
        posArr.push(cc.v2(0.7 * disX, 70));
        posArr.push(targetDis);
        return cc.cardinalSplineBy(this.coinMoveInterval, posArr, 0.1).easing(cc.easeIn(1.2));
    }

    public close() {
        if (this._closeCallback) {
            PopupManager.Instance().showBlockingBG(false);
            this._closeCallback();
        }
        this.particle.active = false;
        this.coinExplodeEffTemplate.active = false;
        this.unscheduleAllCallbacks();
        this.node.removeFromParent();
        this.node.destroy();
    }
}