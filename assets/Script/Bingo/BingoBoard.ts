const { ccclass, property } = cc._decorator;

import BingoData, { BingoBoardState, BingoMarkingType, BingoMirrorBallType } from "./BingoData";
import BingoCell from "./BingoCell";
import UserInfo from "../User/UserInfo";
import { Utility } from "../global_utility/Utility";

@ccclass('BingoBoard')
export default class BingoBoard extends cc.Component {
    @property([cc.Node])
    public bingoColumns: cc.Node[] = [];

    @property(cc.Animation)
    public bingoWinAni: cc.Animation = null;

    @property([cc.Node])
    public bingoWinCntNodes: cc.Node[] = [];

    @property(cc.Node)
    public x2PrizeNode: cc.Node = null;

    @property(cc.Node)
    public center: cc.Node = null;

    // 公共属性
    public boardId: number = 0;

    // 私有核心成员变量 (⚠️ 原变量名拼写完全保留 无修正，如 _activeFrinedIndex)
    public _boardData: BingoData = null;
    public _cells: BingoCell[][] = [];
    public _friendInfo: any = null;
    public _activeFrinedIndex: number = 0;
    public _completeFxs: cc.Node[] = [];
    public _completeFxPos: cc.Vec2[] = [
        cc.v2(0, 0), cc.v2(-152, 0), cc.v2(-76, 0), cc.v2(0, 0), cc.v2(76, 0), cc.v2(152, 0),
        cc.v2(0, 142), cc.v2(0, 71), cc.v2(0, 0), cc.v2(0, -71), cc.v2(0, -142), cc.v2(0, 0), cc.v2(0, 0)
    ];
    private _completeFxRot: number[] = [0, 90, 90, 90, 90, 90, 0, 0, 0, 0, 0, 43, -43];

    // ===================== 核心初始化：棋盘整体初始化 =====================
    public initBingoBoard(boardId: number, cellPrefab: cc.Prefab, boardData: BingoData,para:any) {
        this.node.active = true;
        this._boardData = boardData;
        // this._friendInfo = UserInfo.instance().getUserFriendInfo();
        // this._activeFrinedIndex = Math.floor(Math.random() * this._friendInfo.activeFriends.length);
        this.boardId = boardId;
        cc.log("init bingo board");
        
        this.hideBingoWinAni();
        // 双倍奖励节点显隐
        this.x2PrizeNode.active = this._boardData.isX2Prize();

        // 循环创建 5x5 宾果单元格
        for (let x = 0; x < BingoData.MaxBoardSize; ++x) {
            const columnNode = this.bingoColumns[x];
            const cellArr: BingoCell[] = [];
            for (let y = 0; y < BingoData.MaxBoardSize; ++y) {
                const cellNode = cc.instantiate(cellPrefab);
                const cellCom = cellNode.getComponent(BingoCell);
                let friendPicUrl = "";

                // 好友标记类型 赋值随机好友头像
                if (this._boardData.cells[x][y].markingType == BingoMarkingType.Friend) {
                    friendPicUrl = this.getNextActiveFriendPicUrl();
                }

                cellCom.initBingoCell(boardId, x, y, this._boardData.cells[x][y], friendPicUrl);
                columnNode.addChild(cellNode);
                cellNode.setPosition(0, y * -cellNode.height);
                cellArr.push(cellCom);
            }
            this._cells.push(cellArr);
        }

        this.node.opacity = 255;
        // 棋盘状态判定 保留原逻辑
        if (this._boardData.state !== BingoBoardState.InGame && this._boardData.state !== BingoBoardState.Bingo) {
            this._boardData.state = BingoBoardState.Normal;
        }
    }
    // ===================== 特效初始化：宾果完成特效节点创建 =====================
    public initCompleteFx(lineFx: cc.Prefab, crossFx: cc.Prefab, centerFx: cc.Prefab) {
        let fxIdx = 0;
        // 创建中心特效
        let centerFxNode = cc.instantiate(centerFx);
        this.center.addChild(centerFxNode);
        centerFxNode.setPosition(this._completeFxPos[fxIdx]);
        Utility.setRotation(centerFxNode, this._completeFxRot[fxIdx]);
        this._completeFxs.push(centerFxNode);
        fxIdx++;

        // 创建横线特效
        for (let i = 0; i < BingoData.MaxBoardSize; ++i) {
            const lineFxNode = cc.instantiate(lineFx);
            this.center.addChild(lineFxNode);
            lineFxNode.setPosition(this._completeFxPos[fxIdx]);
            Utility.setRotation(lineFxNode, this._completeFxRot[fxIdx]);
            this._completeFxs.push(lineFxNode);
            fxIdx++;
        }

        // 创建竖线特效
        for (let i = 0; i < BingoData.MaxBoardSize; ++i) {
            const lineFxNode = cc.instantiate(lineFx);
            this.center.addChild(lineFxNode);
            lineFxNode.setPosition(this._completeFxPos[fxIdx]);
            Utility.setRotation(lineFxNode, this._completeFxRot[fxIdx]);
            this._completeFxs.push(lineFxNode);
            fxIdx++;
        }

        // 创建对角线特效
        centerFxNode = cc.instantiate(crossFx);
        this.center.addChild(centerFxNode);
        centerFxNode.setPosition(this._completeFxPos[fxIdx]);
        Utility.setRotation(centerFxNode, this._completeFxRot[fxIdx]);
        this._completeFxs.push(centerFxNode);
        fxIdx++;

        centerFxNode = cc.instantiate(crossFx);
        this.center.addChild(centerFxNode);
        centerFxNode.setPosition(this._completeFxPos[fxIdx]);
        Utility.setRotation(centerFxNode, this._completeFxRot[fxIdx]);
        this._completeFxs.push(centerFxNode);
        fxIdx++;

        // 默认隐藏所有特效
        this.hideBingoCompleteFx();
    }

    // ===================== 特效控制：隐藏宾果完成特效 =====================
    public hideBingoCompleteFx() {
        for (let i = 0; i < this._completeFxs.length; ++i) {
            this._completeFxs[i].active = false;
        }
    }

    // ===================== 特效控制：显示指定宾果完成特效 =====================
    public showBingoCompleteFx(activeArr: number[]) {
        for (let i = 0; i < this._completeFxs.length; ++i) {
            this._completeFxs[i].active = activeArr[i] === 1;
        }
    }

    // ===================== 核心游戏逻辑：开始游戏/重置棋盘 =====================
    public startGame(boardData: BingoData,param:any=null) {
        this._boardData = boardData;
        this._activeFrinedIndex = Math.floor(Math.random() * this._friendInfo.activeFriends.length);
        this.x2PrizeNode.active = false;

        // 游戏中/宾果状态 逻辑
        if (this._boardData.state !== BingoBoardState.Normal) {
            this.node.setScale(0.4, 0.4);
            this.node.runAction(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()));
            // 中心格子星星动画延迟播放
            this._cells[2][2].scheduleOnce(this._cells[2][2].playMarkingStarAni, 0.29);

            for (let x = 0; x < BingoData.MaxBoardSize; ++x) {
                for (let y = 0; y < BingoData.MaxBoardSize; ++y) {
                    this._cells[x][y].reset();
                    this._cells[x][y].setNumber(this._boardData.cells[x][y].num);

                    // 好友标记类型
                    if (this._boardData.cells[x][y].markingType == BingoMarkingType.Friend) {
                        // const friendInfo = UserInfo.instance().getFriendSimpleInfo(this._boardData.cells[x][y].friendUid);
                        // if (friendInfo) {
                        //     this._cells[x][y].setFriendPicture(friendInfo.picUrl);
                        // } else {
                        //     const friendPicUrl = this.getNextActiveFriendPicUrl();
                        //     this._cells[x][y].setFriendPicture(friendPicUrl);
                        // }
                        // this._cells[x][y].setMarking(BingoMarkingType.NonMarking);
                        // this._cells[x][y].scheduleOnce(this._cells[x][y].setMarkingFriendWithAni.bind(this._cells[x][y]), 0.29);
                    } 
                    // 英雄标记类型
                    else if (this._boardData.cells[x][y].markingType == BingoMarkingType.Hero) {
                        this._cells[x][y].loadHeroUI();
                        this._cells[x][y].setMarking(BingoMarkingType.NonMarking);
                    } 
                    // 普通标记类型
                    else {
                        this._cells[x][y].setMarking(this._boardData.cells[x][y].markingType);
                    }

                    // 镜像球宝箱动画
                    if (this._boardData.cells[x][y].isMirrorBall) {
                        this._cells[x][y].playChestAni(this._boardData.cells[x][y].mirrorBallType, 1.3);
                    }
                }
            }
        } 
        // 普通预览状态 逻辑
        else {
            for (let x = 0; x < BingoData.MaxBoardSize; ++x) {
                const self = this;
                const cellInit = (y: number) => {
                    self._cells[x][y].reset();
                    self._cells[x][y].setNumber(self._boardData.cells[x][y].num);

                    // 好友标记类型
                    if (self._boardData.cells[x][y].markingType == BingoMarkingType.Friend) {
                        // const friendInfo = UserInfo.instance().getFriendSimpleInfo(self._boardData.cells[x][y].friendUid);
                        // if (friendInfo) 
                        // {
                        //     self._cells[x][y].setFriendPicture(friendInfo.picUrl);
                        // } else 
                        {
                            const friendPicUrl = self.getNextActiveFriendPicUrl();
                            self._cells[x][y].setFriendPicture(friendPicUrl);
                        }
                        self._cells[x][y].setMarking(BingoMarkingType.NonMarking);
                        const cellCom = self._cells[x][y];
                        const markingType = self._boardData.cells[x][y].markingType;
                        self._cells[x][y].scheduleOnce(() => {
                            cellCom.setMarking(markingType);
                        }, 0.29);
                    }
                    // 英雄标记类型
                    else if (self._boardData.cells[x][y].markingType == BingoMarkingType.Hero) {
                        self._cells[x][y].loadHeroUI();
                        self._cells[x][y].setMarking(BingoMarkingType.NonMarking);
                    }
                    // 普通标记类型
                    else {
                        self._cells[x][y].setMarking(self._boardData.cells[x][y].markingType);
                    }

                    // 设置镜像球状态
                    self._cells[x][y].setMirrorBall(self._boardData.cells[x][y].isMirrorBall?1:0, self._boardData.cells[x][y].mirrorBallType);
                };

                for (let y = 0; y < BingoData.MaxBoardSize; ++y) {
                    cellInit(y);
                }
            }
        }
    }

    // ===================== 核心游戏逻辑：英雄标记完成后执行动画 =====================
    public startAfterHeroMarking() {
        // 游戏中/宾果状态
        if (this._boardData.state !== BingoBoardState.Normal) {
            for (let x = 0; x < BingoData.MaxBoardSize; ++x) {
                for (let y = 0; y < BingoData.MaxBoardSize; ++y) {
                    if (this._boardData.cells[x][y].markingType == BingoMarkingType.Hero) {
                        this._cells[x][y].scheduleOnce(this._cells[x][y].setMarkingHeroWithAni.bind(this._cells[x][y]), 0.29);
                    }
                }
            }
        }
        // 普通预览状态
        else {
            for (let x = 0; x < BingoData.MaxBoardSize; ++x) {
                const self = this;
                const heroAni = (y: number) => {
                    if (self._boardData.cells[x][y].markingType == BingoMarkingType.Hero) {
                        const cellCom = self._cells[x][y];
                        const markingType = self._boardData.cells[x][y].markingType;
                        self._cells[x][y].scheduleOnce(() => {
                            cellCom.setMarking(markingType);
                        }, 0.29);
                    }
                };

                for (let y = 0; y < BingoData.MaxBoardSize; ++y) {
                    heroAni(y);
                }
            }
        }
    }

    // ===================== 棋盘状态判断 & 数据获取 工具方法 =====================
    public isMarking(x: number, y: number): boolean {
        return this._boardData.isMarking(x, y);
    }

    public isMirrorBall(x: number, y: number): boolean {
        return this._boardData.isMirrorBall(x, y);
    }

    public setDummySelectNumber(numArr: number[]) {
        for (let i = 0; i < numArr.length; ++i) {
            const cellData = this._boardData.getCellByNumber(numArr[i]);
            if (cellData) {
                this._cells[cellData.x][cellData.y].setMarking(BingoMarkingType.UserClick);
            }
        }
    }

    public setPrizeBlast() {
        this.x2PrizeNode.active = true;
    }

    public isPrizeBlast(): boolean {
        return this.x2PrizeNode.active;
    }

    public setBingo() {
        this._boardData.state = BingoBoardState.Bingo;
        // 宾果后禁用所有单元格按钮
        for (let x = 0; x < this._cells.length; ++x) {
            for (let y = 0; y < this._cells[x].length; ++y) {
                this._cells[x][y].setBtnActive(0);
            }
        }
    }

    public showBingoWinAni() {
        let bingoCnt = this._boardData.getBingoCnt();
        // 宾果爆炸 强制显示1个宾果数
        if (bingoCnt === 0 && this._boardData.isBingoBalst()) {
            bingoCnt = 1;
        }

        // 显示对应数量的宾果数字节点
        for (let i = 0; i < this.bingoWinCntNodes.length; ++i) {
            this.bingoWinCntNodes[i].active = (i + 1) === bingoCnt;
        }

        // 播放宾果胜利动画
        this.bingoWinAni.node.active = true;
        this.bingoWinAni.setCurrentTime(0);
        this.bingoWinAni.play();
    }

    public hideBingoWinAni() {
        this.bingoWinAni.stop();
        this.bingoWinAni.node.active = false;
    }

    public isBingo(): boolean {
        return this._boardData.state === BingoBoardState.Bingo;
    }

    public isInGame(): boolean {
        return this._boardData.state === BingoBoardState.InGame;
    }

    public isDummyState(): boolean {
        return this._boardData.state === BingoBoardState.Normal;
    }

    public getCellData(x: number, y: number): any {
        return this._boardData.cells[x][y];
    }

    public getBingoCell(x: number, y: number): BingoCell {
        return this._cells[x][y];
    }

    public setBingoCellMirrorBall(x: number, y: number, ballType: BingoMirrorBallType) {
        // this._boardData.setMirrorBall(x, y, true, ballType);
        // this._cells[x][y].playChestAni(ballType, 0);
    }

    // ===================== 单元格交互 核心方法 =====================
    public setSelectable(num: number): boolean {
        // 非游戏状态 执行预览标记
        if (!this.isInGame()) {
            this.isDummyState() && this.setDummySelectNumber([num]);
            return false;
        }

        // 游戏状态 判定是否可选中
        const cellData = this._boardData.getCellByNumber(num);
        if (cellData && !this._boardData.isMarking(cellData.x, cellData.y)) {
            this._cells[cellData.x][cellData.y].setBtnActive(1);
            return true;
        }
        return false;
    }

    public checkSelectable(): boolean {
        // 检测是否有可点击的单元格
        for (let x = 0; x < this._cells.length; ++x) {
            for (let y = 0; y < this._cells[x].length; ++y) {
                if (this._cells[x][y].btn.enabled === true) {
                    return true;
                }
            }
        }
        return false;
    }

    // ===================== 好友头像 随机获取 =====================
    public getNextActiveFriendPicUrl(): string {
        if (this._friendInfo.getActiveFriendCnt() <= this._activeFrinedIndex) {
            return "";
        }
        const picUrl = this._friendInfo.activeFriends[this._activeFrinedIndex].picUrl;
        this._activeFrinedIndex = (this._activeFrinedIndex + 1) % this._friendInfo.activeFriends.length;
        return picUrl;
    }

    // ===================== 单元格标记 核心方法 =====================
    public setCellMarkingType(x: number, y: number, markingType: number|BingoMarkingType) {
        if (this.isBingo()) {
            cc.log("already bingo");
            return;
        }

        // this._boardData.setMarking(x, y, markingType);
        // const cellCom = this._cells[x][y];
        // cellCom.setMarking(markingType);

        // // 好友标记 刷新头像
        // if (markingType === BingoMarkingType.Friend) {
        //     const friendPicUrl = this.getNextActiveFriendPicUrl();
        //     if (friendPicUrl) {
        //         cellCom.setFriendPicture(friendPicUrl);
        //     }
        // }
        // // 英雄标记 加载英雄UI
        // else if (markingType === BingoMarkingType.Hero) {
        //     cellCom.loadHeroUI();
        // }

        // // 播放标记数字动画
        // cellCom.playMarkingNumAni();
    }
}