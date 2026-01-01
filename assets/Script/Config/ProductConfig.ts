
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";

/** 商品道具关联信息类 */
export class ProductItemRelationInfo {
    itemId: string;
    itemType: number;
    addCnt: number;
    addTime: number;
    payCode: string;
    extraInfo: string;

    constructor() {
        this.itemId = "";
        this.itemType = 0;
        this.addCnt = 0;
        this.addTime = 0;
        this.payCode = "";
        this.extraInfo = "";
    }

    init(data: any): void {
        this.itemId = data.itemId;
        this.itemType = data.itemType;
        this.addCnt = data.addCnt;
        this.addTime = data.addTime;
        this.payCode = data.payCode;
        this.extraInfo = data.extraInfo;
    }

    static getCnt(targetItemId: string, list: ProductItemRelationInfo[]): number {
        let total = 0;
        for (let i = 0; i < list.length; ++i) {
            list[i].itemId == targetItemId && (total += list[i].addCnt);
        }
        return total;
    }
}

/** 商品配置信息实体类 */
export class ProductInfo {
    productId: string;
    name: string;
    buyMoney: number;
    buyCurrency: string;
    playstoreId: string;
    appstoreId: string;
    instantId: string;
    extraInfo: string;

    constructor() {
        this.productId = "";
        this.name = "";
        this.buyMoney = 0;
        this.buyCurrency = "";
        this.playstoreId = "";
        this.appstoreId = "";
        this.instantId = "";
        this.extraInfo = "";
    }

    init(data: any): void {
        this.productId = data.id;
        this.name = data.name;
        this.buyMoney = data.buyMoney;
        this.buyCurrency = data.buyCurrency;
        this.playstoreId = data.playstoreId;
        this.appstoreId = data.appstoreId;
        this.instantId = data.fbInstantId;
        const rel = data.relationInfos[0];
        this.extraInfo = rel.extraInfo;
    }
}

/** 商品配置管理类 - 单例模式 (核心) */
export class ProductConfig {
    private static _instance: ProductConfig = null;
    private _products: { [productId: string]: ProductInfo } = {};

    public static Instance(): ProductConfig {
        if (ProductConfig._instance == null) {
            cc.error("ProductConfig not initialized");
        }
        return ProductConfig._instance;
    }

    public static Init(configData: any): boolean {
        ProductConfig._instance = new ProductConfig();
        ProductConfig._instance.initProductConfig(configData);
        return true;
    }

    private initProductConfig(configData: any): void {
        const isQA = TSUtility.isQAService();
        const isIOS = cc.sys.os === cc.sys.OS_IOS;
        const isRenewal = SDefine.Mobile_IAP_Renewal;
        if (isQA && isIOS && isRenewal) {
            cc.log("apple product id converting for QA service");
        }

        const productArr = configData.product || [];
        for (let i = 0; i < productArr.length; ++i) {
            const pInfo = new ProductInfo();
            pInfo.init(productArr[i]);
            if (isQA && isIOS && isRenewal) {
                pInfo.appstoreId = pInfo.appstoreId + "_qa";
            }
            this._products[pInfo.productId] = pInfo;
        }
    }

    public getProductInfo(productId: string): ProductInfo {
        return this._products[productId];
    }

    public getProductIDs_iOS(): string[] {
        const ids: string[] = [];
        for (const key in this._products) {
            const pid = this._products[key].appstoreId;
            ids.indexOf(pid) === -1 && ids.push(pid);
        }
        return ids;
    }

    public getProductIDs_AOS(): string[] {
        const ids: string[] = [];
        for (const key in this._products) {
            const pid = this._products[key].playstoreId;
            ids.indexOf(pid) === -1 && ids.push(pid);
        }
        return ids;
    }
}