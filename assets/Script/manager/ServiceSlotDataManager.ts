import FireHoseSender, { FHLogType } from "../FireHoseSender";
import SlotBannerInfo from "../SlotBannerInfo";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";

const {ccclass, property} = cc._decorator;

export enum SlotBannerFrameType{
    BLUE = "blue",
    PURPLE = "purple",
    YELLOW = "yellow"
}


export class SlotUseData {
    private _isUseDev: boolean = false;
    private _isUseQA: boolean = false;
    private _isUseLive: boolean = false;

    public get isUseDev(): boolean { return this._isUseDev; }
    public get isUseQA(): boolean { return this._isUseQA; }
    public get isUseLive(): boolean { return this._isUseLive; }

    public static parseObj(t: any): SlotUseData | null {
        if (!TSUtility.isValid(t)) return null;
        const n = new SlotUseData();
        TSUtility.isValid(t.isUseDev) && (n._isUseDev = t.isUseDev);
        TSUtility.isValid(t.isUseQA) && (n._isUseQA = t.isUseQA);
        TSUtility.isValid(t.isUseLive) && (n._isUseLive = t.isUseLive);
        return n;
    }
}

@ccclass
export default class ServiceSlotDataManager extends cc.Component {
    private static _instance: ServiceSlotDataManager = null!;
    public static get instance(): ServiceSlotDataManager {
        if (!this._instance) this._instance = new ServiceSlotDataManager();
        return this._instance;
    }

    private PATH_SERVICE_DATA: string = "ServiceSlot";
    private _data: { [key: string]: any } = {};
    private _arrMostPlayedSlot: any[] = [];

    public get data(): { [key: string]: any } {
        return this._data;
    }

    public get arrMostPlayedSlot(): any[] {
        return this._arrMostPlayedSlot;
    }

    public async initialize(): Promise<boolean> {
        return new Promise((resolve) => {
            cc.loader.loadResDir(this.PATH_SERVICE_DATA, cc.JsonAsset, (err, resArray) => {
                if (TSUtility.isValid(err)) {
                    const error = new Error("cc.loader.loadResDir fail %s: %s".format(this.PATH_SERVICE_DATA, JSON.stringify(err)));
                    FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                    resolve(false);
                    return;
                }
                for (let i = 0; i < resArray.length; i++) {
                    const jsonAsset = resArray[i];
                    if (TSUtility.isValid(jsonAsset) && TSUtility.isValid(jsonAsset.json)) {
                        const slotData = ServiceSlotData.parseObj(jsonAsset.json);
                        if (TSUtility.isValid(slotData) && TSUtility.isValid(slotData.id) && !this.isContainsSlotID(slotData.id)) {
                            this._data[slotData.id] = slotData;
                        }
                    }
                }
                resolve(true);
            });
        });
    }

    public isContainsSlotID(e: string): boolean {
        return e in this._data;
    }

    public getDataBySlotID(e: string): any {
        return this._data[e];
    }

    public getSceneBySlotID(e: string): string {
        const t = this.getDataBySlotID(e);
        return t ? t.scene : "";
    }

    public getNameBySlotID(e: string): string {
        const t = this.getDataBySlotID(e);
        return t ? t.name : "";
    }

    public getResourceDataBySlotID(e: string): SlotResourceData | null {
        const t = this.getDataBySlotID(e);
        return t ? t.resource : null;
    }

    public getUseDataBySlotID(e: string): SlotUseData | null {
        const t = this.getDataBySlotID(e);
        return t ? t.use : null;
    }

    public getLoadingDataBySlotID(e: string): SlotLoadingData | null {
        const t = this.getDataBySlotID(e);
        return t ? t.loading : null;
    }

    public isWithDynamicSlot(e: string): boolean {
        if (TSUtility.isDynamicSlot(e)) return true;
        const t = "%s_dy".format(e);
        return this.isContainsSlotID(t);
    }

    public isGaugeStackSlot(e: string): boolean {
        const t = this.getDataBySlotID(e);
        return !!t && t.isGaugeStackSlot;
    }

    public updateMostPlayedSlot(e: any[]): void {
        this._arrMostPlayedSlot = e;
    }

    public getSlotZoneInfo(e: any): any {
        const t = UserInfo.instance().slotZoneInfo[e];
        return TSUtility.isValid(t) ? t : [];
    }

    public getSlotArrayBySlotName(e: any, t: string): SlotBannerInfo[] {
        const n = this.getSlotZoneInfo(e);
        if (!TSUtility.isValid(n)) return [];
        const o: SlotBannerInfo[] = [];
        for (let a = 0; a < n.slotList.length; a++) {
            const i = new SlotBannerInfo();
            i.parseObj(n.slotList[a]);
            if (this.isAvailableSlot(i) && i.strSlotID.toLowerCase().includes(t.toLowerCase())) {
                o.push(i);
            }
        }
        return o;
    }

    public getTagSlotArray(e: any, t: string): SlotBannerInfo[] {
        const n = this.getSlotZoneInfo(e);
        if (!TSUtility.isValid(n)) return [];
        const o: SlotBannerInfo[] = [];
        for (let a = 0; a < n.slotList.length; a++) {
            const i = new SlotBannerInfo();
            i.parseObj(n.slotList[a]);
            if (this.isAvailableSlot(i) && i.strFlag == t) {
                o.push(i);
            }
        }
        return o;
    }

    public getSlotBannerInfo(e: any, t?: string): SlotBannerInfo | null {
        if (!TSUtility.isValid(t) || t.length <= 0) return null;
        const n = this.getSlotZoneInfo(e);
        if (!TSUtility.isValid(n)) return null;
        for (let o = 0; o < n.slotList.length; o++) {
            const a = new SlotBannerInfo();
            a.parseObj(n.slotList[o]);
            if (this.isAvailableSlot(a) && a.strSlotID == t) {
                return a;
            }
        }
        return null;
    }

    public getHasTagSlot(e: any, t: string, n: string): SlotBannerInfo | undefined {
        return this.getTagSlotArray(e, t).find(function (e) {
            return e.strSlotID == n;
        });
    }

    public isAvailableSlot(e: SlotBannerInfo): boolean {
        if (!TSUtility.isValid(e)) return false;
        const t = SDefine.getSlotSceneInfo(e.strSlotID);
        if (!TSUtility.isValid(t)) {
            if (!TSUtility.isDevService()) return false;
        } else if (TSUtility.isDevService() && !t.useDev || TSUtility.isQAService() && !t.useQA || TSUtility.isLiveService() && !t.useLive) {
            return false;
        }
        return true;
    }

    public static JACKPOT_GRAND = [
        SDefine.SUBGAMEID_SLOT_DIAMONDSTRIKE, SDefine.SUBGAMEID_SLOT_AMERICAN9EAGLES,
        SDefine.SUBGAMEID_SLOT_BIRDJACKPOT, SDefine.SUBGAMEID_SLOT_BIRDJACKPOT_DY,
        SDefine.SUBGAMEID_SLOT_BELLSTRIKEFRENZY, SDefine.SUBGAMEID_SLOT_FATTURKEYWILDS,
        SDefine.SUBGAMEID_SLOT_FORTUNETREE, SDefine.SUBGAMEID_SLOT_FIREBLASTCLASSIC,
        SDefine.SUBGAMEID_SLOT_FOURTHOFJULYWILDRESPIN, SDefine.SUBGAMEID_SLOT_BLAZINGBULLWILD,
        SDefine.SUBGAMEID_SLOT_DIAMONDBEAMJACKPOT, SDefine.SUBGAMEID_SLOT_EMERALDGREEN, "zhuquefortune"
    ];
    public static JACKPOT_COUNT_2: any[] = [];
    public static JACKPOT_COUNT_1: any[] = [];
    public static ADD_JACKPOT_KEY = [
        SDefine.SUBGAMEID_SLOT_FIREBLASTCLASSIC, SDefine.SUBGAMEID_SLOT_FOURTHOFJULYWILDRESPIN,
        SDefine.SUBGAMEID_SLOT_DIAMONDBEAMJACKPOT, SDefine.SUBGAMEID_SLOT_EMERALDGREEN,
        SDefine.SUBGAMEID_SLOT_ALOHAHAWAII, SDefine.SUBGAMEID_SLOT_ALOHAHAWAII_DY
    ];
    public static CUSTOM_SLOT_DATA = [{
        slotID: SDefine.SUBGAMEID_SLOT_CURIOUSMERMAID, type: SlotBannerFrameType.BLUE, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_MYSTICGYPSY, type: SlotBannerFrameType.BLUE, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_DRAGONTALES, type: SlotBannerFrameType.YELLOW, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_ORIENTALLANTERNS, type: SlotBannerFrameType.YELLOW, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_CASINOROYALE, type: SlotBannerFrameType.PURPLE, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_RAINBOWPEARL, type: SlotBannerFrameType.BLUE, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_PHARAOHSBEETLELINK, type: SlotBannerFrameType.BLUE, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_CLASSICLOCKROLLGRAND, type: SlotBannerFrameType.PURPLE, isUserGrand: false, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_ALOHAHAWAII, type: SlotBannerFrameType.BLUE, isUserGrand: true, index: 0
    }, {
        slotID: SDefine.SUBGAMEID_SLOT_PIGGYBANKRICHES, type: SlotBannerFrameType.BLUE, isUserGrand: false, index: 0
    }];
    public static LINKED_SLOT_BANNER = [{
        linkedKey: "mysticgypsi_curiousmermaid", type: SlotBannerFrameType.BLUE, index: 2
    }, {
        linkedKey: "dragontales_orientallanterns", type: SlotBannerFrameType.YELLOW, index: 3
    }];
}

export class ServiceSlotData {
    private _strSlotScene: string = "";
    private _strSlotName: string = "";
    private _strSlotID: string = "";
    private _dataUse: SlotUseData | null = null;
    private _dataLoading: SlotLoadingData | null = null;
    private _dataResource: SlotResourceData | null = null;
    private _isGaugeStackSlot: boolean = false;

    public get scene(): string { return this._strSlotScene; }
    public get name(): string { return this._strSlotName; }
    public get id(): string { return this._strSlotID; }
    public get isGaugeStackSlot(): boolean { return this._isGaugeStackSlot; }
    public get use(): SlotUseData | null { return this._dataUse; }
    public get loading(): SlotLoadingData | null { return this._dataLoading; }
    public get resource(): SlotResourceData | null { return this._dataResource; }

    public static parseObj(t: any): ServiceSlotData | null {
        if (!TSUtility.isValid(t)) return null;
        const n = new ServiceSlotData();
        TSUtility.isValid(t.slotScene) && (n._strSlotScene = t.slotScene);
        TSUtility.isValid(t.slotName) && (n._strSlotName = t.slotName);
        TSUtility.isValid(t.slotID) && (n._strSlotID = t.slotID);
        TSUtility.isValid(t.isGaugeStackSlot) && (n._isGaugeStackSlot = t.isGaugeStackSlot);
        TSUtility.isValid(t.use) && (n._dataUse = SlotUseData.parseObj(t.use));
        TSUtility.isValid(t.loading) && (n._dataLoading = SlotLoadingData.parseObj(t.loading));
        TSUtility.isValid(t.resource) && (n._dataResource = SlotResourceData.parseObj(t.resource));
        return n;
    }
}

export class SlotLoadingData {
    public PATH_SYMBOL_IMAGE = "Service/01_Lobby/SlotBanner/SymbolImage/";
    private _strLeftSymbolImage: string = "";
    private _strLeftSymbolTitle: string = "";
    private _strLeftSymbolDescription: string = "";
    private _strRightSymbolImage: string = "";
    private _strRightSymbolTitle: string = "";
    private _strRightSymbolDescription: string = "";

    public get leftImage(): string { return this._strLeftSymbolImage; }
    public get leftTitle(): string { return this._strLeftSymbolTitle; }
    public get leftDesc(): string { return this._strLeftSymbolDescription; }
    public get rightImage(): string { return this._strRightSymbolImage; }
    public get rightTitle(): string { return this._strRightSymbolTitle; }
    public get rightDesc(): string { return this._strRightSymbolDescription; }

    public static parseObj(t: any): SlotLoadingData | null {
        if (!TSUtility.isValid(t)) return null;
        const n = new SlotLoadingData();
        TSUtility.isValid(t.leftSymbolImage) && (n._strLeftSymbolImage = t.leftSymbolImage);
        TSUtility.isValid(t.leftSymbolTitle) && (n._strLeftSymbolTitle = t.leftSymbolTitle);
        TSUtility.isValid(t.leftSymbolDescription) && (n._strLeftSymbolDescription = t.leftSymbolDescription);
        TSUtility.isValid(t.rightSymbolImage) && (n._strRightSymbolImage = t.rightSymbolImage);
        TSUtility.isValid(t.rightSymbolTitle) && (n._strRightSymbolTitle = t.rightSymbolTitle);
        TSUtility.isValid(t.rightSymbolDescription) && (n._strRightSymbolDescription = t.rightSymbolDescription);
        return n;
    }

    public async setSlotSymbolImage(e: string, t: Function | null): Promise<void> {
        return new Promise((resolve, reject) => {
            if (TSUtility.isValid(e)) {
                cc.loader.loadRes(this.PATH_SYMBOL_IMAGE + e, (err, res) => {
                    if (!TSUtility.isValid(err)) {
                        TSUtility.isValid(t) && t(new cc.SpriteFrame(res));
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            } else {
                reject();
            }
        });
    }
}

export class SlotResourceData {
    public PATH_IMAGE = "ServiceSlot/Image/";
    public PATH_SPINE = "ServiceSlot/SpineBanner/";
    private _strBannerPrefab: string = "";
    private _strSpinePrefab: string = "";
    private _strSmallBannerImage: string = "";
    private _strLongBannerImage: string = "";
    private _cacheSmallImage: cc.SpriteFrame = null;
    private _cacheLongImage: cc.SpriteFrame = null;
    private _cacheSpine: any = null;

    public get isHasCacheLongImage(): boolean { return TSUtility.isValid(this._cacheLongImage); }
    public get isHasCacheSmallImage(): boolean { return TSUtility.isValid(this._cacheSmallImage); }
    public get isHasCacheSpine(): boolean { return TSUtility.isValid(this._cacheSpine); }
    public get prefab(): string { return this._strBannerPrefab; }
    public get spine(): string { return this._strSpinePrefab; }
    public get smallImage(): string { return this._strSmallBannerImage; }
    public get longImage(): string { return this._strLongBannerImage; }
    public get spineURL(): string { return this.PATH_SPINE + this._strSpinePrefab; }
    public get smallURL(): string { return TSUtility.getCommonResourceUrl() + "slotbanner/SmallBanner/" + this._strSmallBannerImage + ".png"; }
    public get longURL(): string { return TSUtility.getCommonResourceUrl() + "slotbanner/LongBanner/" + this._strLongBannerImage + ".png"; }

    public static parseObj(t: any): SlotResourceData | null {
        if (!TSUtility.isValid(t)) return null;
        const n = new SlotResourceData();
        TSUtility.isValid(t.bannerPrefab) && (n._strBannerPrefab = t.bannerPrefab);
        TSUtility.isValid(t.spinePrefab) && (n._strSpinePrefab = t.spinePrefab);
        TSUtility.isValid(t.smallBannerImage) && (n._strSmallBannerImage = t.smallBannerImage);
        TSUtility.isValid(t.longBannerImage) && (n._strLongBannerImage = t.longBannerImage);
        return n;
    }

    public loadSmallImage(e: Function | null): void {
        const t = this;
        if (!TSUtility.isValid(this._cacheSmallImage)) {
            cc.assetManager.loadRemote(this.smallURL, (err, res) => {
                if (!TSUtility.isValid(err)) {
                    t._cacheSmallImage = TSUtility.getSpriteFrame(res as cc.Texture2D);
                    TSUtility.isValid(e) && e(t._cacheSmallImage, t.smallURL);
                } else {
                    console.log("SlotResourceData - small image load error " + JSON.stringify(err));
                }
            });
        } else {
            TSUtility.isValid(e) && e(this._cacheSmallImage, this.smallURL);
        }
    }

    public loadLongImage(e: Function | null): void {
        const t = this;
        if (!TSUtility.isValid(this._cacheLongImage)) {
            cc.assetManager.loadRemote(this.longURL, (err, res) => {
                if (!TSUtility.isValid(err)) {
                    t._cacheLongImage = TSUtility.getSpriteFrame(res as cc.Texture2D);
                    TSUtility.isValid(e) && e(t._cacheLongImage, t.longURL);
                } else {
                    console.log("SlotResourceData - long image load error " + JSON.stringify(err));
                }
            });
        } else {
            TSUtility.isValid(e) && e(this._cacheLongImage, this.longURL);
        }
    }

    public loadSpine(e: Function | null): void {
        const t = this;
        if (!TSUtility.isValid(this._cacheSpine)) {
            cc.loader.loadRes(this.spineURL, (err, res) => {
                if (!TSUtility.isValid(err) && TSUtility.isValid(res)) {
                    t._cacheSpine = res;
                    TSUtility.isValid(e) && e(t._cacheSpine, t.spineURL);
                } else {
                    e && e(null, t.spineURL);
                }
            });
        } else {
            TSUtility.isValid(e) && e(this._cacheSpine, this.spineURL);
        }
    }

    public async preloadLongImage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loadLongImage((e) => {
                TSUtility.isValid(e) ? resolve() : reject();
            });
        });
    }

}
