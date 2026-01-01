const { ccclass } = cc._decorator;

@ccclass()
export default class LeagueShopInfo {
    /** 当前购买次数 */
    curPurchaseCnt: number = 0;
    /** 下一次刷新时间戳 */
    nextRefreshDate: number = 0;
    /** 历史购买次数 */
    prevPurchaseCnt: number = 0;
    /** 商品ID */
    productID: string = "";

    /**
     * 解析后端返回数据到当前实例
     * @param data 后端返回的原始数据对象
     */
    parseObj(data: any): void {
        if (null != data.curPurchaseCnt) this.curPurchaseCnt = data.curPurchaseCnt;
        if (null != data.nextRefreshDate) this.nextRefreshDate = data.nextRefreshDate;
        if (null != data.prevPurchaseCnt) this.prevPurchaseCnt = data.prevPurchaseCnt;
        if (null != data.productID) this.productID = data.productID;
    }
}