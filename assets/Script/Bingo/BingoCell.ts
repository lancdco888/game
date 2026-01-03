const { ccclass, property } = cc._decorator;

import BingoData, { BingoMarkingType, BingoMirrorBallType } from "./BingoData";
import MessageRoutingManager from "../message/MessageRoutingManager";
// import FBPictureSetter from "../UI/FBPictureSetter";
import BingoCellEffect from "./BingoCellEffect";
import UserInfo from "../User/UserInfo";
import HeroInfoUI, { HeroInfoUIType } from "../Hero/HeroInfoUI";
import TSUtility from "../global_utility/TSUtility";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import HeroSpineController from "../Slot/HeroSpineController";
import { Utility } from "../global_utility/Utility";

@ccclass('BingoCell')
export default class BingoCell extends cc.Component {
    @property(cc.Label)
    public numberLabel: cc.Label = null;

    @property(cc.Label)
    public markingNumberLabel: cc.Label = null;

    @property(cc.Animation)
    public coinAni: cc.Animation = null;

    @property(cc.Animation)
    public bingoBallAni: cc.Animation = null;

    @property(cc.Animation)
    public energyBlastAni: cc.Animation = null;

    @property(cc.Animation)
    public splashBlastAni: cc.Animation = null;

    @property(cc.Animation)
    public bingoBlastAni: cc.Animation = null;

    @property(cc.Animation)
    public prizeBlastAni: cc.Animation = null;

    @property(cc.Animation)
    public markStarAni: cc.Animation = null;

    @property(cc.Animation)
    public markNumAni: cc.Animation = null;

    @property(cc.Animation)
    public markFriendAni: cc.Animation = null;

    @property(cc.Animation)
    public markHeroAni: cc.Animation = null;

    @property(cc.Sprite)
    public friendImg: cc.Sprite = null;

    @property(cc.Node)
    public heroPivot: cc.Node = null;

    @property(cc.Button)
    public btn: cc.Button = null;

    // 公共属性
    public col: number = 0;
    public row: number = 0;
    public boardId: number = 0;
    public animation: any = null;

    // 私有核心属性
    private markingType: BingoMarkingType = BingoMarkingType.NonMarking;

    // ===================== 核心初始化：单元格初始化 =====================
    public initBingoCell(boardId: number, col: number, row: number, cellData: any, friendPicUrl: string = "") {
        // 绑定点击事件 + 禁用按钮默认状态
        this.btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoCell", "onClickBtn", ""));
        this.btn.enabled = false;

        // 赋值基础数据
        this.boardId = boardId;
        this.col = col;
        this.row = row;
        
        // 初始化数字显示
        this.numberLabel.string = "1";
        this.friendImg.node.active = false;

        // 好友标记类型 - 加载好友头像
        if (cellData.markingType == BingoMarkingType.Friend) {
            this.friendImg.node.active = true;
            const friendInfo = UserInfo.instance().getFriendSimpleInfo(cellData.friendUid);
            if (friendInfo) {
                this.setFriendPicture(friendInfo.picUrl);
            } else {
                this.setFriendPicture(friendPicUrl);
            }
        }
        // 英雄标记类型 - 加载英雄UI
        else if (cellData.markingType == BingoMarkingType.Hero) {
            this.loadHeroUI();
        }

        // 赋值数字 + 标记类型 + 镜像球状态
        this.setNumber(cellData.num);
        this.setMarking(cellData.markingType);
        this.setMirrorBall(cellData.isMirrorBall, cellData.mirrorBallType);
    }

    // ===================== 重置方法：隐藏所有特效动画 =====================
    public reset() {
        this.coinAni.node.active = false;
        this.bingoBallAni.node.active = false;
        this.energyBlastAni.node.active = false;
        this.splashBlastAni.node.active = false;
        this.bingoBlastAni.node.active = false;
        this.prizeBlastAni.node.active = false;
    }

    // ===================== 加载英雄UI：异步加载英雄预制体 + Spine动画设置 =====================
    public loadHeroUI() {
        const self = this;
        const heroInfoData = UserInfo.instance().getUserHeroInfo();
        const heroInfo = heroInfoData.getHeroInfo(heroInfoData.activeHeroID);

        if (heroInfo) {
            // 拼接英雄资源路径
            const heroResPath = `Hero/${heroInfoData.activeHeroID}_${HeroInfoUIType.Small}`;
            cc.loader.loadRes(heroResPath, (err, prefab) => {
                // 节点有效性校验 防止内存泄漏
                if (!TSUtility.isValid(self)) return;

                if (err) {
                    // 加载失败 错误上报
                    const error = new Error(`cc.loader.loadRes fail ${heroResPath}: ${JSON.stringify(err)}`);
                    FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                    return;
                }

                // 实例化英雄UI 并设置Spine愉悦度
                const heroNode = cc.instantiate(prefab);
                const heroSpineCom = heroNode.getComponent(HeroSpineController);
                self.heroPivot.removeAllChildren();
                self.heroPivot.addChild(heroNode);
                heroNode.setPosition(cc.Vec2.ZERO);
                heroSpineCom.setPleasure(heroInfo.rank);
            });
        }
    }

    // ===================== 按钮点击事件：派发单元格点击消息 =====================
    public onClickBtn() {
        const sendData = {
            boardId: this.boardId,
            col: this.col,
            row: this.row
        };
        // 派发点击消息
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.BINGO_CELL_CLICK, JSON.stringify(sendData));
        // 关闭单元格特效
        BingoCellEffect.instance().offEffect(this.boardId);
    }

    // ===================== 设置单元格数字 =====================
    public setNumber(num: number) {
        this.numberLabel.node.active = true;
        this.numberLabel.string = num.toString();
        this.markingNumberLabel.string = num.toString();
    }

    // ===================== 核心方法：设置镜像球特效类型 =====================
    public setMirrorBall(isMirrorBall: number, ballType: BingoMirrorBallType) {
        this.reset();
        // 非标记状态 才显示镜像球特效
        if (isMirrorBall !== 0 && this.markingType == BingoMarkingType.NonMarking) {
            switch (ballType) {
                case BingoMirrorBallType.MirrorBallTypeCoin10K:
                case BingoMirrorBallType.MirrorBallTypeCoin20K:
                case BingoMirrorBallType.MirrorBallTypeCoin30K:
                    this.coinAni.node.active = true;
                    break;
                case BingoMirrorBallType.MirrorBallTypeBingoBallX1:
                case BingoMirrorBallType.MirrorBallTypeBingoBallX2:
                case BingoMirrorBallType.MirrorBallTypeBingoBallX3:
                    this.bingoBallAni.node.active = true;
                    break;
                case BingoMirrorBallType.MirrorBallTypeEnergeBlast:
                    this.energyBlastAni.node.active = true;
                    break;
                case BingoMirrorBallType.MirrorBallTypeSplashBlast:
                    this.splashBlastAni.node.active = true;
                    break;
                case BingoMirrorBallType.MirrorBallTypePrizeBlastX2:
                    this.prizeBlastAni.node.active = true;
                    break;
                case BingoMirrorBallType.MirrorBallTypeBingo:
                    this.bingoBlastAni.node.active = true;
                    break;
            }
        }
    }

    // ===================== 设置按钮激活状态 + 单元格特效开关 =====================
    public setBtnActive(isActive: number) {
        if (isActive === 1) {
            this.btn.enabled = true;
            // 派发特效消息
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.BINGO_CELL_EFFECT, null);
            // 开启单元格高亮特效
            BingoCellEffect.instance().onEffect(this.node, this.boardId);
        } else {
            this.btn.enabled = false;
        }
    }

    // ===================== 播放各类标记动画 =====================
    public playMarkingStarAni() {
        this.markStarAni.node.active = true;
        this.markStarAni.play();
    }

    public playMarkingNumAni() {
        this.markNumAni.node.active = true;
        this.markNumAni.play();
    }

    public playMarkingFriendAni() {
        this.markFriendAni.node.active = true;
        this.markFriendAni.play();
    }

    public playMarkingHeroAni() {
        this.markHeroAni.node.active = true;
        this.markHeroAni.play();
    }

    // ===================== 播放镜像球宝箱动画 (带延迟) =====================
    public playChestAni(ballType: BingoMirrorBallType, delayTime: number) {
        const self = this;
        this.scheduleOnce(() => {
            switch (ballType) {
                case BingoMirrorBallType.MirrorBallTypeCoin10K:
                case BingoMirrorBallType.MirrorBallTypeCoin20K:
                case BingoMirrorBallType.MirrorBallTypeCoin30K:
                    self.coinAni.node.active = true;
                    self.coinAni.play();
                    break;
                case BingoMirrorBallType.MirrorBallTypeBingoBallX1:
                case BingoMirrorBallType.MirrorBallTypeBingoBallX2:
                case BingoMirrorBallType.MirrorBallTypeBingoBallX3:
                    self.bingoBallAni.node.active = true;
                    self.bingoBallAni.play();
                    break;
                case BingoMirrorBallType.MirrorBallTypeEnergeBlast:
                    self.energyBlastAni.node.active = true;
                    self.energyBlastAni.play();
                    break;
                case BingoMirrorBallType.MirrorBallTypeSplashBlast:
                    self.splashBlastAni.node.active = true;
                    self.splashBlastAni.play();
                    break;
                case BingoMirrorBallType.MirrorBallTypePrizeBlastX2:
                    self.prizeBlastAni.node.active = true;
                    self.prizeBlastAni.play();
                    break;
                case BingoMirrorBallType.MirrorBallTypeBingo:
                    self.bingoBlastAni.node.active = true;
                    self.bingoBlastAni.play();
                    break;
            }
        }, delayTime);
    }

    // ===================== 设置好友头像 =====================
    public setFriendPicture(picUrl: string) {
        if (picUrl !== "") {
            //FBPictureSetter.loadProfilePicture(picUrl, FBPictureSetter.FB_PICTURE_TYPE.SMALL, this.friendImg, null);
        }
    }

    // ===================== 带动画的标记设置 =====================
    public setMarkingFriendWithAni() {
        this.setMarking(BingoMarkingType.Friend);
        this.playMarkingFriendAni();
    }

    public setMarkingHeroWithAni() {
        this.setMarking(BingoMarkingType.Hero);
        this.playMarkingHeroAni();
    }

    // ===================== 核心方法：设置单元格标记类型 (控制所有显示状态) =====================
    public setMarking(markingType: BingoMarkingType) {
        this.markingType = markingType;
        this.btn.enabled = false; // 标记后禁用按钮

        switch (markingType) {
            // 无标记 - 默认状态
            case BingoMarkingType.NonMarking:
                this.friendImg.node.active = false;
                this.markNumAni.node.active = false;
                this.markStarAni.node.active = false;
                this.markFriendAni.node.active = false;
                this.markHeroAni.node.active = false;
                break;
            // 好友标记
            case BingoMarkingType.Friend:
                this.friendImg.node.active = true;
                this.markNumAni.node.active = false;
                this.markStarAni.node.active = false;
                this.markFriendAni.node.active = true;
                this.markHeroAni.node.active = false;
                this.reset();
                break;
            // 英雄标记
            case BingoMarkingType.Hero:
                this.friendImg.node.active = false;
                this.markNumAni.node.active = false;
                this.markStarAni.node.active = false;
                this.markFriendAni.node.active = false;
                this.markHeroAni.node.active = true;
                this.reset();
                break;
            // 中心默认标记
            case BingoMarkingType.MiddleDefault:
                this.friendImg.node.active = false;
                this.markNumAni.node.active = false;
                this.markStarAni.node.active = true;
                this.markFriendAni.node.active = false;
                this.markHeroAni.node.active = false;
                this.reset();
                break;
            // 用户点击标记
            case BingoMarkingType.UserClick:
                this.friendImg.node.active = false;
                this.markNumAni.node.active = true;
                this.markStarAni.node.active = false;
                this.markFriendAni.node.active = false;
                this.markHeroAni.node.active = false;
                this.reset();
                break;
        }
    }
}