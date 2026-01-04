const { ccclass } = cc._decorator;

// 导入依赖模块，路径与原JS完全一致，无需修改
import SDefine from "../global_utility/SDefine";

/**
 * 自定义大奖子ID数据类 - 原JS匿名内部类(u)完整还原
 * 负责：存储单款游戏的ID+对应子ID列表、大奖类型校验、大厅大奖金额计算
 */
export class CustomJackpotSubID {
    private _strGameID: string = "";
    private _listSubID: string[] = [];

    constructor(gameID: string, subIDList: string[]) {
        this._strGameID = gameID;
        this._listSubID = subIDList;
    }

    public getGameID(): string {
        return this._strGameID;
    }

    public getSubIDList(): string[] {
        return this._listSubID;
    }

    public isExistJackpotType(jackpotIns: any, idx: number): boolean {
        const subIds = this._listSubID[idx].split(",");
        let isExist = true;
        for (let a = 0; a < subIds.length; ++a) {
            if (!jackpotIns.isExistJackpotType(Number(subIds[a]))) {
                isExist = false;
                break;
            }
        }
        return isExist;
    }

    public isProgressiveJackpot(jackpotIns: any, idx: number): boolean {
        const subIds = this._listSubID[idx].split(",");
        let isProgressive = true;
        for (let a = 0; a < subIds.length; ++a) {
            if (!jackpotIns.isProgressiveJackpot(Number(subIds[a]))) {
                isProgressive = false;
                break;
            }
        }
        return isProgressive;
    }

    public getJackpotForLobbySlot(jackpotIns: any, idx: number): number {
        const subIds = this._listSubID[idx].split(",");
        let totalJackpot = 0;
        for (let a = 0; a < subIds.length; ++a) {
            totalJackpot += jackpotIns.getJackpotForLobbySlot(Number(subIds[a]));
        }
        return totalJackpot;
    }

    public getJackpotForLobbySlot_BetCustom(jackpotIns: any, idx: number, betCoin: number, coinSize: number): number {
        const subIds = this._listSubID[idx].split(",");
        let totalJackpot = 0;
        for (let l = 0; l < subIds.length; ++l) {
            totalJackpot += jackpotIns.getJackpotMoneyByCoinSize(Number(subIds[l]), betCoin, coinSize);
        }
        return totalJackpot;
    }

    public getCustomJackpotMoney(jackpotIns: any, idx: number, zoneId: number): number {
        const subIds = this._listSubID[idx].split(",");
        let totalJackpot = 0;
        for (let i = 0; i < subIds.length; ++i) {
            totalJackpot += jackpotIns.getCustomJackpotMoney(subIds[i], zoneId);
        }
        return totalJackpot;
    }
}

/**
 * 自定义大奖奖金数据类 - 原JS匿名内部类(p)完整还原
 * 负责：存储单款游戏的ID+子ID+奖金档位+最大投注档位、自定义奖金倍率计算
 */
export class CustomJackpotMoney {
    private _strGameID: string = "";
    private _listSubID: string[] = [];
    private _listPrize: string[] = [];
    private _listMaxBetPerLine: string[] = [];

    constructor(gameID: string, subIDList: string[], prizeList: string[], maxBetList: string[]) {
        this._strGameID = gameID;
        this._listSubID = subIDList;
        this._listPrize = prizeList;
        this._listMaxBetPerLine = maxBetList;
    }

    public getGameID(): string {
        return this._strGameID;
    }

    public getJackpotForLobbySlot_BetCustom(jackpotIns: any, subId: string, zoneId: number, betCoin: number, coinSize: number): number {
        const idx = this._listSubID.indexOf(subId);
        let prizeValue = 0;
        if (idx !== -1) {
            prizeValue = zoneId === SDefine.LIGHTNING_ZONEID 
                ? Number(this._listPrize[idx]) * Number(this._listMaxBetPerLine[0])
                : Number(this._listPrize[idx]) * Number(this._listMaxBetPerLine[1]);
        }

        const splitSubIds = this._listSubID[idx].split(",");
        let jackpotValue = 0;
        for (let u = 0; u < splitSubIds.length; ++u) {
            jackpotValue += jackpotIns.getJackpotMoneyByCoinSize(Number(splitSubIds[u]), betCoin, coinSize);
        }
        return jackpotValue + prizeValue * (betCoin / coinSize);
    }

    public getCustomJackpotMoney(subId: string, zoneId: number): number {
        const idx = this._listSubID.indexOf(subId);
        if (idx === -1) return 0;
        return zoneId === SDefine.LIGHTNING_ZONEID
            ? Number(this._listPrize[idx]) * Number(this._listMaxBetPerLine[0])
            : Number(this._listPrize[idx]) * Number(this._listMaxBetPerLine[1]);
    }
}

/**
 * 自定义大奖数据全局管理器 - 单例模式
 * 核心功能：初始化所有老虎机的自定义大奖配置、提供配置查询/匹配/计算的全局接口
 * 无序列化属性，无需编辑器绑定，挂载到常驻节点即可全局调用
 */
@ccclass("CustomJackpotDataManager")
export default class CustomJackpotDataManager{
    // ===================== 【单例核心】原JS完整还原 函数式单例 全局调用方式不变 =====================
    private static _instance: CustomJackpotDataManager = null;

    public static instance(): CustomJackpotDataManager {
        if (this._instance === null) {
            this._instance = new CustomJackpotDataManager();
            this._instance.initialize();
        }
        return this._instance;
    }

    // ===================== 【私有成员变量】原JS完整还原 精准类型标注 =====================
    private _listCustomJackpotSubID: CustomJackpotSubID[] = [];
    private _listCustomJackpotMoney: CustomJackpotMoney[] = [];

    // ===================== 【核心初始化】原JS所有硬编码配置 一字不差完整复刻 无任何修改 =====================
    private initialize(): void {
        this.addCustomJackpotSubID("bankofwealth", ["9", "8", "7"]);
        this.addCustomJackpotSubID("cashshowdown", ["2", "1"]);
        this.addCustomJackpotSubID("imperialgoldfortune", ["4", "3", "2"]);
        this.addCustomJackpotSubID("bingotrio", ["4", "3", "2"]);
        this.addCustomJackpotSubID("greatamerica", ["2", "1", "0"]);
        this.addCustomJackpotSubID("piggyhouses", ["3", "2"]);
        this.addCustomJackpotSubID("jiujiujiu999", ["4", "3", "2"]);
        this.addCustomJackpotSubID("marineadventure", ["3"]);
        this.addCustomJackpotSubID("rapidhitantarctic", ["11", "10", "9"]);
        this.addCustomJackpotSubID("babysantawild", ["4", "3", "2"]);
        this.addCustomJackpotSubID("fruityblast", ["5", "4", "3"]);
        this.addCustomJackpotSubID("shamrocklock", ["4", "3", "2"]);
        this.addCustomJackpotSubID("sevenglory", ["4", "3", "2"]);
        this.addCustomJackpotSubID("goldeneagleking", ["3", "2", "1"]);
        this.addCustomJackpotSubID("phoenixignite", ["2"]);
        this.addCustomJackpotSubID("vivalasvegas", ["4", "3"]);
        this.addCustomJackpotSubID("jollyrogerjackpot", ["10", "9", "8"]);
        this.addCustomJackpotSubID("supernovablasts", ["4", "3", "2"]);
        this.addCustomJackpotSubID("volcanictahiti", ["4"]);
        this.addCustomJackpotSubID("vampressmansion", ["4"]);
        this.addCustomJackpotSubID("flameofliberty", ["3", "2", "1"]);
        this.addCustomJackpotSubID("meowgicalhalloween", ["4", "3", "2"]);
        this.addCustomJackpotSubID("wildbunch", ["4"]);
        this.addCustomJackpotSubID("bonanzaexpress", ["0"]);
        this.addCustomJackpotSubID("dualdiamondsstrike", ["8,4", "7,3", "6,2"]);
        this.addCustomJackpotSubID("luckybunnydrop", ["4"]);
        this.addCustomJackpotSubID("alienamigos", ["3", "2", "1"]);
        this.addCustomJackpotSubID("dualfortunepot", ["4", "3", "2"]);
        this.addCustomJackpotSubID("megabingoclassic", ["3", "2"]);
        this.addCustomJackpotSubID("drmadwin", ["4"]);
        this.addCustomJackpotSubID("dakotafarmgirl", ["4"]);
        this.addCustomJackpotSubID("supersevenblasts", ["8", "7", "6"]);
        this.addCustomJackpotSubID("aztecodyssey", ["3", "2"]);
        this.addCustomJackpotSubID("superdrumbash", ["4", "3", "2"]);
        this.addCustomJackpotSubID("allamerican", ["3", "2"]);
        this.addCustomJackpotSubID("pawsomepanda", ["5", "4", "3"]);
        this.addCustomJackpotSubID("nuttysquirrel", ["2", "1", "0"]);
        this.addCustomJackpotSubID("witchsapples", ["3", "2"]);
        this.addCustomJackpotSubID("theoddranch", ["3"]);
        this.addCustomJackpotSubID("railroadraiders", ["4"]);
        this.addCustomJackpotSubID("huffndoze", ["5", "4"]);
        this.addCustomJackpotSubID("phoenixignite_dy", ["2"]);
        this.addCustomJackpotSubID("dualfortunepot_dy", ["4", "3", "2"]);
        this.addCustomJackpotSubID("thunderstrike", ["3", "2"]);
        this.addCustomJackpotSubID("fortunepot", ["3", "2"]);
        this.addCustomJackpotSubID("rhinoblitz", ["3", "2"]);
        this.addCustomJackpotSubID("dragontales", ["3", "2"]);
        this.addCustomJackpotSubID("orientallanterns", ["3", "2"]);
        this.addCustomJackpotSubID("pharaohsecrets", ["3", "2"]);
        this.addCustomJackpotSubID("pumpkinfortune", ["3", "2"]);
        this.addCustomJackpotSubID("fatturkeywilds", ["4", "3"]);
        this.addCustomJackpotSubID("alohahawaii", ["3", "2"]);
        this.addCustomJackpotSubID("alohahawaii_dy", ["3", "2"]);
        this.addCustomJackpotSubID("bigbucksbounty", ["3", "2"]);
        this.addCustomJackpotSubID("winyourheart", ["3", "2"]);
        this.addCustomJackpotSubID("thearcanealchemist", ["3", "2"]);
        this.addCustomJackpotSubID("wickedlildevil", ["4", "3"]);
        this.addCustomJackpotSubID("thanksgivinggalore", ["3", "2"]);
        this.addCustomJackpotSubID("thebeastssecret", ["3", "2"]);
        this.addCustomJackpotSubID("robinhoodsecondshot", ["4", "3"]);
        this.addCustomJackpotSubID("piggymania", ["5", "4"]);
        this.addCustomJackpotSubID("piggymania_dy", ["5", "4"]);
        this.addCustomJackpotSubID("dragonsandpearls", ["4", "3"]);
        this.addCustomJackpotSubID("themobking", ["3", "2"]);
        this.addCustomJackpotSubID("candycastle", ["3", "2"]);
        this.addCustomJackpotSubID("raccoonshowdown", ["3", "2"]);
        this.addCustomJackpotSubID("witchpumpkins", ["3", "2"]);
        this.addCustomJackpotSubID("boonanza", ["3", "2"]);
        this.addCustomJackpotSubID("starryholidays", ["3", "2"]);
        this.addCustomJackpotSubID("hoardinggoblins", ["3", "2"]);
        this.addCustomJackpotSubID("cupidlovespells", ["2", "1"]);
        this.addCustomJackpotSubID("zeusthundershower", ["3", "2"]);
        this.addCustomJackpotSubID("piratebootyrapidhit", ["8", "7"]);
        this.addCustomJackpotSubID("houndofhades", ["3", "2"]);
        this.addCustomJackpotSubID("jumbopiggies", ["3", "2"]);
        this.addCustomJackpotSubID("dragonorbs", ["3", "2"]);
        this.addCustomJackpotSubID("talesofarcadia", ["5", "4"]);
        this.addCustomJackpotSubID("pinupparadise", ["3", "2"]);
        this.addCustomJackpotSubID("cupidloveydovey", ["3", "2"]);
        this.addCustomJackpotSubID("thehogmancer", ["3", "2"]);
        this.addCustomJackpotSubID("dragonblast", ["3", "2"]);
        this.addCustomJackpotSubID("kongsmash", ["3", "2"]);
        this.addCustomJackpotSubID("eggstraeaster", ["3", "2"]);
        this.addCustomJackpotSubID("peachyfortune", ["3", "2"]);
        this.addCustomJackpotSubID("sakuraninja", ["3", "2"]);
        this.addCustomJackpotSubID("theoztales", ["3", "2"]);
        this.addCustomJackpotSubID("davyjonesslocker", ["3"]);
        this.addCustomJackpotSubID("zhuquefortune", ["4", "3"]);
        this.addCustomJackpotSubID("penguinforce", ["3", "2"]);
        this.addCustomJackpotSubID("beelovedjars", ["3", "2"]);
        this.addCustomJackpotSubID("twilightdragon", ["3", "2"]);

        this.addCustomJackpotMoney("fruityblast", ["5", "4", "3"], ["510", "130", "110"], ["12000000", "300000000"]);
        this.addCustomJackpotMoney("flameofliberty", ["3", "2", "1"], ["900", "90", "18", "9"], ["120000000", "3000000000"]);
        this.addCustomJackpotMoney("wildhearts", ["3", "2", "1"], ["300", "40", "20"], ["120000000", "3000000000"]);
        this.addCustomJackpotMoney("dingdongjackpots", ["3", "2", "1"], ["1200", "120", "60"], ["24000000", "600000000"]);
        this.addCustomJackpotMoney("bloodgems", ["3", "2", "1"], ["9000", "900", "450"], ["12000000", "300000000"]);
        this.addCustomJackpotMoney("superdrumbash", ["4", "3", "2"], ["2500", "250", "125"], ["24000000", "600000000"]);
        this.addCustomJackpotMoney("allstarcircus", ["3", "2", "1"], ["3000", "600", "200"], ["24000000", "600000000"]);
        this.addCustomJackpotMoney("shanghaiexpress", ["3", "2"], ["2500", "500"], ["12000000", "300000000"]);
        this.addCustomJackpotMoney("smashncash", ["3"], ["3000"], ["24000000", "600000000"]);
        this.addCustomJackpotMoney("templeofathena", ["3"], ["5000"], ["24000000", "600000000"]);
        this.addCustomJackpotMoney("cupidloveydovey", ["3", "2"], ["0", "5000"], ["1200000", "30000000"]);
        this.addCustomJackpotMoney("thehogmancer", ["3", "2"], ["40000", "2000"], ["3000000", "75000000"]);
        this.addCustomJackpotMoney("wildhearts_dy", ["3", "2", "1"], ["450", "60", "30"], ["120000000", "3000000000"]);
    }

    // ===================== 【核心业务方法】原JS所有方法100%复刻 逻辑无任何修改 =====================
    private addCustomJackpotSubID(gameID: string, subIDList: string[]): void {
        const isExist = this._listCustomJackpotSubID.some(item => item.getGameID() === gameID);
        if (!isExist) {
            this._listCustomJackpotSubID.push(new CustomJackpotSubID(gameID, subIDList));
        }
    }

    private addCustomJackpotMoney(gameID: string, subIDList: string[], prizeList: string[], maxBetList: string[]): void {
        const isExist = this._listCustomJackpotMoney.some(item => item.getGameID() === gameID);
        if (!isExist) {
            this._listCustomJackpotMoney.push(new CustomJackpotMoney(gameID, subIDList, prizeList, maxBetList));
        }
    }

    public getCustomJackpotSubIDList(): CustomJackpotSubID[] {
        return this._listCustomJackpotSubID;
    }

    public getCustomJackpotMoneyList(): CustomJackpotMoney[] {
        return this._listCustomJackpotMoney;
    }

    public findCustomJackpotSubID(gameID: string): CustomJackpotSubID | null {
        const filterList = this._listCustomJackpotSubID.filter(item => item.getGameID() === gameID);
        return filterList.length > 0 ? filterList[0] : null;
    }

    public findCustomJackpotMoney(gameID: string): CustomJackpotMoney | null {
        const filterList = this._listCustomJackpotMoney.filter(item => item.getGameID() === gameID);
        return filterList.length > 0 ? filterList[0] : null;
    }
}