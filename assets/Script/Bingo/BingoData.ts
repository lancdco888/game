import TSUtility from '../global_utility/TSUtility';
const { ccclass: ccClass } = cc._decorator;

/** 标记类型-字符串枚举 */
export enum BingoMarkingType {
    NonMarking = "N",
    MiddleDefault = "M",
    Friend = "F",
    UserClick = "U",
    Hero = "H"
}

/** 魔球类型-字符串枚举 */
export enum BingoMirrorBallType {
    MirrorBallTypeNone = "",
    MirrorBallTypeCoin10K = "COIN10K",
    MirrorBallTypeCoin20K = "COIN20K",
    MirrorBallTypeCoin30K = "COIN30K",
    MirrorBallTypeBingoBallX1 = "BBX1",
    MirrorBallTypeBingoBallX2 = "BBX2",
    MirrorBallTypeBingoBallX3 = "BBX3",
    MirrorBallTypeEnergeBlast = "EB",
    MirrorBallTypeSplashBlast = "SB",
    MirrorBallTypePrizeBlastX2 = "PBX2",
    MirrorBallTypeBingo = "BINGO"
}

/** 棋盘状态-数字枚举 */
export enum BingoBoardState {
    Normal = 0,
    InGame = 1,
    Bingo = 2
}

/** 全局常量-最大球号 */
export const MaxBingoBallCnt: number = 75;
/** 全局常量-每行最大球数 */
export const MaxRowBingoBallCnt: number = MaxBingoBallCnt / 5;

/** 坐标类 */
export class BingoVec2 {
    public col: number = 0;
    public row: number = 0;

    public init(data: { col: number, row: number }): void {
        this.col = data.col;
        this.row = data.row;
    }
}

/** 棋盘单元格数据类 */
export class BingoCellData {
    public num: number = 0;
    public markingType: BingoMarkingType = BingoMarkingType.NonMarking;
    public isMirrorBall: boolean = false;
    public mirrorBallType: BingoMirrorBallType = BingoMirrorBallType.MirrorBallTypeNone;
    public friendUid: number = -1;

    public init(data: { num?: number, markingType?: BingoMarkingType, isMirrorBall?: boolean, mirrorBallType?: BingoMirrorBallType, friendUid?: number }): void {
        TSUtility.isValid(data.num) && (this.num = data.num!);
        TSUtility.isValid(data.markingType) && (this.markingType = data.markingType!);
        TSUtility.isValid(data.isMirrorBall) && (this.isMirrorBall = data.isMirrorBall!);
        TSUtility.isValid(data.mirrorBallType) && (this.mirrorBallType = data.mirrorBallType!);
        TSUtility.isValid(data.friendUid) && (this.friendUid = data.friendUid!);
    }

    /** 是否已标记 (原JS命名isMakring，保留无修改) */
    public isMakring(): boolean {
        return this.markingType != BingoMarkingType.NonMarking;
    }

    public isCoinBlast(): boolean {
        return [BingoMirrorBallType.MirrorBallTypeCoin10K, BingoMirrorBallType.MirrorBallTypeCoin20K, BingoMirrorBallType.MirrorBallTypeCoin30K].includes(this.mirrorBallType);
    }

    public isBingoBallBlast(): boolean {
        return [BingoMirrorBallType.MirrorBallTypeBingoBallX1, BingoMirrorBallType.MirrorBallTypeBingoBallX2, BingoMirrorBallType.MirrorBallTypeBingoBallX3].includes(this.mirrorBallType);
    }

    public isSplashBlast(): boolean {
        return this.mirrorBallType == BingoMirrorBallType.MirrorBallTypeSplashBlast;
    }

    public isEnergeBlast(): boolean {
        return this.mirrorBallType == BingoMirrorBallType.MirrorBallTypeEnergeBlast;
    }

    public isBingoBlast(): boolean {
        return this.mirrorBallType == BingoMirrorBallType.MirrorBallTypeBingo;
    }

    public isPrizeBlast(): boolean {
        return this.mirrorBallType == BingoMirrorBallType.MirrorBallTypePrizeBlastX2;
    }
}

/** 主棋盘数据类 - 默认导出，与原JS保持一致 */
@ccClass
export default class BingoGameInfo {
    public static MaxBoardSize: number = 5;
    public cells: BingoCellData[][] = [];
    public state: BingoBoardState = BingoBoardState.Normal;

    /** 静态解析方法 */
    public static Parse(data: any): BingoGameInfo {
        const info = new BingoGameInfo();
        info.init(data);
        return info;
    }

    public init(data: { state: BingoBoardState, cells: any[][] }): void {
        this.state = data.state;
        for (let row = 0; row < BingoGameInfo.MaxBoardSize; ++row) {
            const cellRow: BingoCellData[] = [];
            for (let col = 0; col < BingoGameInfo.MaxBoardSize; ++col) {
                const cell = new BingoCellData();
                cell.init(data.cells[row][col]);
                cellRow.push(cell);
            }
            this.cells.push(cellRow);
        }
    }

    public isInGame(): boolean {
        return this.state == BingoBoardState.InGame;
    }

    public setNumber(row: number, col: number, num: number): void {
        if (row >= BingoGameInfo.MaxBoardSize || col >= BingoGameInfo.MaxBoardSize) {
            cc.error(`setMarking our of range ${row} ${col} ${num}`);
            return;
        }
        this.cells[row][col].num = num;
    }

    public setMirrorBall(row: number, col: number, isMirrorBall: boolean, type: BingoMirrorBallType): void {
        if (row >= BingoGameInfo.MaxBoardSize || col >= BingoGameInfo.MaxBoardSize) {
            cc.error(`setMirrorBall our of range ${row} ${col}`);
            return;
        }
        this.cells[row][col].isMirrorBall = isMirrorBall;
        this.cells[row][col].mirrorBallType = type;
    }

    public setMarking(row: number, col: number, type: BingoMarkingType): void {
        if (row >= BingoGameInfo.MaxBoardSize || col >= BingoGameInfo.MaxBoardSize) {
            cc.error(`setMarking our of range ${row} ${col} ${type}`);
            return;
        }
        this.cells[row][col].markingType = type;
    }

    public isMarking(row: number, col: number): boolean {
        if (row >= BingoGameInfo.MaxBoardSize || col >= BingoGameInfo.MaxBoardSize) {
            cc.error(`isMarking our of range ${row} ${col}`);
            return false;
        }
        return this.cells[row][col].isMakring();
    }

    public isMirrorBall(row: number, col: number): boolean {
        if (row >= BingoGameInfo.MaxBoardSize || col >= BingoGameInfo.MaxBoardSize) {
            cc.error(`isMirrorBall our of range ${row} ${col}`);
            return false;
        }
        return this.cells[row][col].isMirrorBall;
    }

    public getCellByNumber(num: number): cc.Vec2 | null {
        const row = Math.floor((num - 1) / MaxRowBingoBallCnt);
        for (let col = 0; col < this.cells[row].length; ++col) {
            if (this.cells[row][col].num == num) {
                return cc.v2(row, col);
            }
        }
        return null;
    }

    public getBingoCnt(): number {
        let cnt = 0;
        this.isFourCornerBingo() && ++cnt;
        for (let i = 0; i < BingoGameInfo.MaxBoardSize; ++i) this.isColumnBingo(i) && ++cnt;
        for (let i = 0; i < BingoGameInfo.MaxBoardSize; ++i) this.isRowBingo(i) && ++cnt;
        this.isLeftTopDiagonalBingo() && ++cnt;
        this.isLeftDownDiagonalBingo() && ++cnt;
        return cnt;
    }

    public getBingoCompleteResult(): boolean[] {
        const result: boolean[] = [];
        const total = 3 + 2 * BingoGameInfo.MaxBoardSize;
        for (let i = 0; i < total; ++i) result.push(false);
        let idx = 0;
        this.isFourCornerBingo() && (result[idx] = true); idx++;
        for (let i = 0; i < BingoGameInfo.MaxBoardSize; ++i) this.isColumnBingo(i) && (result[idx] = true), idx++;
        for (let i = 0; i < BingoGameInfo.MaxBoardSize; ++i) this.isRowBingo(i) && (result[idx] = true), idx++;
        this.isLeftTopDiagonalBingo() && (result[idx] = true); idx++;
        this.isLeftDownDiagonalBingo() && (result[idx] = true); idx++;
        return result;
    }

    public isColumnBingo(col: number): boolean {
        for (let row = 0; row < BingoGameInfo.MaxBoardSize; ++row) {
            if (!this.cells[col][row].isMakring()) return false;
        }
        return true;
    }

    public isRowBingo(row: number): boolean {
        for (let col = 0; col < BingoGameInfo.MaxBoardSize; ++col) {
            if (!this.cells[col][row].isMakring()) return false;
        }
        return true;
    }

    public isFourCornerBingo(): boolean {
        const maxIdx = BingoGameInfo.MaxBoardSize - 1;
        return this.cells[0][0].isMakring() 
            && this.cells[0][maxIdx].isMakring() 
            && this.cells[maxIdx][0].isMakring() 
            && this.cells[maxIdx][maxIdx].isMakring();
    }

    public isLeftTopDiagonalBingo(): boolean {
        for (let i = 0; i < BingoGameInfo.MaxBoardSize; ++i) {
            if (!this.cells[i][i].isMakring()) return false;
        }
        return true;
    }

    public isLeftDownDiagonalBingo(): boolean {
        for (let row = BingoGameInfo.MaxBoardSize - 1, col = 0; col < BingoGameInfo.MaxBoardSize; ++col, --row) {
            if (!this.cells[row][col].isMakring()) return false;
        }
        return true;
    }

    public isX2Prize(): boolean {
        for (let row = 0; row < BingoGameInfo.MaxBoardSize; ++row) {
            for (let col = 0; col < BingoGameInfo.MaxBoardSize; ++col) {
                const cell = this.cells[row][col];
                if (cell.isMirrorBall && cell.mirrorBallType === BingoMirrorBallType.MirrorBallTypePrizeBlastX2 && cell.isMakring()) {
                    return true;
                }
            }
        }
        return false;
    }

    /** 原JS命名isBingoBalst，保留无修改 */
    public isBingoBalst(): boolean {
        for (let row = 0; row < BingoGameInfo.MaxBoardSize; ++row) {
            for (let col = 0; col < BingoGameInfo.MaxBoardSize; ++col) {
                const cell = this.cells[row][col];
                if (cell.isMirrorBall && cell.mirrorBallType === BingoMirrorBallType.MirrorBallTypeBingo && cell.isMakring()) {
                    return true;
                }
            }
        }
        return false;
    }
}

/** 全局游戏信息类 */
export class BingoGameGlobalInfo {
    public markingGauge: number = 0;
    public boards: BingoGameInfo[] = [];
    public lastStartTime: number = 0;
    public ballHistory: number[] = [];
    public dailyGameCnt: number = 0;
    public nextDailyResetTime: number = 0;
    public nextResetTime: number = 0;
    public gameKey: string = "";

    public static parse(data: any): BingoGameGlobalInfo {
        const info = new BingoGameGlobalInfo();
        info.markingGauge = data.markingGauge;
        info.boards.push(BingoGameInfo.Parse(data.boards[0]));
        info.boards.push(BingoGameInfo.Parse(data.boards[1]));
        info.lastStartTime = data.lastStartTime;
        info.ballHistory = data.ballHistory.slice();
        info.dailyGameCnt = data.dailyGameCnt;
        info.nextDailyResetTime = data.nextDailyResetTime;
        info.nextResetTime = data.nextResetTime;
        data.gameKey && (info.gameKey = data.gameKey);
        return info;
    }
}

/** 下一个魔球信息 */
export class NextMirrorBallInfo {
    public cell0: BingoVec2 | null = null;
    public cell1: BingoVec2 | null = null;
    public mirrorBallType: BingoMirrorBallType = BingoMirrorBallType.MirrorBallTypeNone;

    public static parse(data: any): NextMirrorBallInfo {
        const info = new NextMirrorBallInfo();
        if (data.cell0) {
            info.cell0 = new BingoVec2();
            info.cell0.init(data.cell0);
        }
        if (data.cell1) {
            info.cell1 = new BingoVec2();
            info.cell1.init(data.cell1);
        }
        data.mirrorBallType && (info.mirrorBallType = data.mirrorBallType);
        return info;
    }
}

/** 原JS命名MirrorBallBastInfo，保留无修改 */
export class MirrorBallBastInfo {
    public result: NextMirrorBallInfo[] = [];

    public static parse(data: any[]): MirrorBallBastInfo {
        const info = new MirrorBallBastInfo();
        for (let i = 0; i < data.length; ++i) {
            info.result.push(NextMirrorBallInfo.parse(data[i]));
        }
        return info;
    }
}