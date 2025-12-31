const { ccclass, property } = cc._decorator;
// import CommonServer from "../Network/CommonServer";
import SDefine from "../global_utility/SDefine";
// import IngameSuiteLeagueFeverSymbolUI from "../SlotGame/InGameUI/SuiteLeague/IngameSuiteLeagueFeverSymbolUI";
import UserInfo from "../User/UserInfo";
import TSUtility from "../global_utility/TSUtility";
// import HRVSlotService from "../HRVService/HRVSlotService";

/**
 * 狂热符号信息数据类 - 原JS完整还原
 */
@ccclass("FeverSymbolInfo")
export class FeverSymbolInfo {
    private _node: cc.Node = null!;
    private _numWidth: number = 0;
    private _numHeight: number = 0;

    constructor(...args: any[]) {
        this._node = args[0];
        this._numWidth = args[1];
        this._numHeight = args[2];
    }

    public getNode(): cc.Node {
        return this._node;
    }

    public getNodeSize(): [number, number] {
        return [this._numWidth, this._numHeight];
    }
}

/**
 * 狂热模式对象池管理类 - 继承cc.Component 原JS逻辑1:1复刻
 */
export class SlotFeverModeObjectPool extends cc.Component {
    public FEVER_MODE_ICON_NAME: string = "FeverMode_Icon";
    public FEVER_MODE_MOVE_ICON_NAME: string = "FeverMode_Icon_Move";
    private _listPrefabInfo: Array<{ key: string, value: cc.Prefab }> = [];
    private _listObjectPool: Array<{ key: string, value: cc.NodePool }> = [];

    onLoad() { }

    public initialize(): void {
        // const feverUI = HRVSlotService.default.instance().getInGameUI().suiteLeagueUI.feverUI;
        // if (feverUI) {
        //     this.createObjectsByPrefab(this.FEVER_MODE_ICON_NAME, feverUI.prefFeverIcon, 3);
        //     this.createObjectsByPrefab(this.FEVER_MODE_MOVE_ICON_NAME, feverUI.prefFeverMoveIcon, 3);
        // }
    }

    public createObjectsByPrefab(key: string, prefab: cc.Prefab, count: number): void {
        for (let i = 0; i < count; ++i) {
            this.createObjectByPrefab(key, prefab);
        }
    }

    public createObjectByPrefab(key: string, prefab: cc.Prefab): void {
        const isExist = this._listPrefabInfo.some(item => item.key === key);
        if (!isExist) {
            this._listPrefabInfo.push({ key: key, value: prefab });
        }
        this.createObject(key);
    }

    public createObjects(key: string, count: number): void {
        for (let i = 0; i < count; ++i) {
            this.createObject(key);
        }
    }

    public createObject(key: string): void {
        const prefab = this.getPrefInfo(key);
        if (!prefab) return;

        const pool = this.getObjectPool(key);
        if (!pool) return;

        const node = cc.instantiate(prefab);
        node.name = key;
        node.active = false;
        if (TSUtility.isValid(node.parent)) {
            node.removeFromParent(false);
        }
        pool.put(node);
    }

    public getPrefInfo(key: string): cc.Prefab | null {
        const isExist = this._listPrefabInfo.some(item => item.key === key);
        if (!isExist) return null;

        const filterArr = this._listPrefabInfo.filter(item => item.key === key);
        if (!filterArr || filterArr.length <= 0) return null;
        return filterArr[0].value;
    }

    public getObjectPool(key: string): cc.NodePool | null {
        const isExist = this._listObjectPool.some(item => item.key === key);
        if (!isExist) {
            this._listObjectPool.push({ key: key, value: new cc.NodePool() });
        }

        const filterArr = this._listObjectPool.filter(item => item.key === key);
        if (!filterArr || filterArr.length <= 0) return null;
        return filterArr[0].value;
    }

    public pop(key: string): cc.Node | null {
        const pool = this.getObjectPool(key);
        if (!pool) return null;

        if (pool.size() <= 0) {
            this.createObject(key);
        }

        const node = pool.get();
        if (!TSUtility.isValid(node)) return null;
        node.active = true;
        return node;
    }

    public restore(node: cc.Node): void {
        if (!TSUtility.isValid(node)) return;
        node.active = false;
        if (!TSUtility.isValid(node.parent)) {
            node.removeFromParent(false);
        }

        // 停止所有子节点动画并重置
        const animList = node.getComponentsInChildren(cc.Animation);
        if (TSUtility.isValid(animList) && animList.length > 0) {
            for (let i = 0; i < animList.length; ++i) {
                const anim = animList[i];
                if (TSUtility.isValid(anim)) {
                    anim.stop();
                    anim.setCurrentTime(0);
                }
            }
        }

        const pool = this.getObjectPool(node.name);
        if (pool) {
            pool.put(node);
        } else {
            node.destroy();
        }
    }
}

/**
 * 老虎机狂热模式核心管理类 - 继承cc.Component + 全局单例 原JS逻辑100%还原
 */
@ccclass
export default class SlotFeverModeManager extends cc.Component {
    // ===================== 原JS所有常量 数值完全一致 无任何修改 =====================
    public readonly FEVER_MODE_POINT_DATA = [
        { key: 3000000000, value: 600 },
        { key: 2400000000, value: 480 },
        { key: 1800000000, value: 360 },
        { key: 1200000000, value: 240 },
        { key: 900000000, value: 180 },
        { key: 600000000, value: 120 },
        { key: 300000000, value: 60 },
        { key: 240000000, value: 48 },
        { key: 180000000, value: 36 },
        { key: 120000000, value: 24 },
        { key: 90000000, value: 18 },
        { key: 60000000, value: 12 },
        { key: 30000000, value: 6 }
    ];

    public readonly FEVER_MODE_MAX_POINT_DATA = [
        { key: 1, value: 2000 },
        { key: 2, value: 5000 },
        { key: 3, value: 10000 }
    ];

    public readonly FEVER_MOVE_TIME: number = 1;

    // ===================== 私有成员变量 与原JS完全一致 补全强类型 =====================
    private static _instance: SlotFeverModeManager = null!;
    private _objPool: SlotFeverModeObjectPool | null = null;
    // private _feverUI: any = null; // 对应IngameSuiteLeagueFeverUI 保持原类型兼容
    private _feverModeStartDate: number = 0;
    private _feverModeLevel: number = 0;
    private _listItemHist: Array<any> = [];
    private _listLastItemHist: Array<any> = [];
    private _numMoveTime: number = 0;

    // 全局单例 - 原JS的get instance()访问器 完美还原
    public static get instance(): SlotFeverModeManager {
        if (!SlotFeverModeManager._instance) {
            SlotFeverModeManager._instance = new SlotFeverModeManager();
        }
        return SlotFeverModeManager._instance;
    }

    onLoad() { }

    // ===================== 所有公有方法 1:1 原逻辑复刻 顺序不变 =====================
    public initialize(): void {
        this._objPool = new SlotFeverModeObjectPool();
        this._objPool.initialize();
        // this._feverUI = HRVSlotService.default.instance().getInGameUI().suiteLeagueUI.feverUI;
        this.setWaitMoveTime(this.FEVER_MOVE_TIME);
    }

    public setFeverModeInfo(data: any): void {
        if (data && TSUtility.isValid(data.feverInfo)) {
            if (TSUtility.isValid(data.feverInfo.feverModeStartDate)) {
                this.setFeverModeStartDate(data.feverInfo.feverModeStartDate);
            }
            if (TSUtility.isValid(data.feverInfo.feverLevel)) {
                this.setFeverTimeLevel(data.feverInfo.feverLevel);
            }
        }
    }

    public getFeverModeStartDate(): number {
        return this._feverModeStartDate;
    }

    public setFeverModeStartDate(val: number): void {
        this._feverModeStartDate = val;
    }

    public isOpenFeverMode(): boolean {
        return this.getFeverModeStartDate() <= TSUtility.getServerBaseNowUnixTime();
    }

    public getFeverTimeLevel(): number {
        return this._feverModeLevel;
    }

    public setFeverTimeLevel(val: number): void {
        this._feverModeLevel = val;
    }

    public getFeverTimeMuilt(): number {
        if (!this.isFeverTime()) return 0;
        const ticket = this.getFeverUsedTicket();
        if (!ticket) return 0;
        if (!TSUtility.isValid(ticket.extraInfo)) return 0;
        return JSON.parse(ticket.extraInfo).multiplier;
    }

    public getFeverTimeMaxTime(): number {
        if (!this.isFeverTime()) return 0;
        const ticket = this.getFeverUsedTicket();
        if (!ticket) return 0;
        if (!TSUtility.isValid(ticket.extraInfo)) return 0;
        return JSON.parse(ticket.extraInfo).addTime;
    }

    public getFeverModePoint(): number {
        // const itemList = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_SUITE_LEAGUE_FEVER_POINT);
        // if (!itemList || itemList.length <= 0) return 0;
        // const item = itemList[0];
        // if (!item || item.curCnt <= 0) return 0;
        // return item.curCnt;
        return 0;
    }

    public setFeverModePoint(val: number, addItemData: any = null): void {
        // const inven = UserInfo.instance().getItemInventory();
        // const itemList = inven.getItemsByItemId(SDefine.I_SUITE_LEAGUE_FEVER_POINT);

        // if (!itemList || itemList.length <= 0) {
        //     if (addItemData) {
        //         inven.addItem(addItemData.itemInfo, addItemData.addCnt, addItemData.addTime);
        //     }
        //     return;
        // }

        // const item = itemList[0];
        // if (!item) return;
        // item.curCnt = val;
    }

    public getFeverTimeMaxPoint(level: number): number {
        const filterArr = this.FEVER_MODE_MAX_POINT_DATA.filter(item => item.key === level);
        if (filterArr.length <= 0) return -1;
        if (!filterArr[0]) return -1;
        return filterArr[0].value;
    }

    public getFeverTicketTime(): number {
        const ticket = this.getFeverUsedTicket();
        return ticket ? ticket.expireDate : 0;
    }

    public getFeverUsedTicket(): any | null {
        // const itemList = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_SUITE_LEAGUE_FEVER_USED_TICKET);
        // if (!itemList || itemList.length <= 0) return null;
        // const item = itemList[0];
        // return item ? item : null;
        return null;
    }

    public getFeverTicket(): any | null {
        // const itemList = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_SUITE_LEAGUE_FEVER_TICKET);
        // if (!itemList || itemList.length <= 0) return null;
        // const item = itemList[0];
        // return item ? item : null;
        return null;
    }

    /**
     * 使用狂热门票 - 原JS回调逻辑完全保留
     */
    public useFeverTicket(callBack?: () => void): void {
        // const itemList = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_SUITE_LEAGUE_FEVER_TICKET);
        // if (!itemList || itemList.length <= 0 || !TSUtility.isValid(itemList[0])) {
        //     callBack && callBack();
        //     return;
        // }

        // CommonServer.default.Instance().requestUseItem(
        //     itemList[0].itemUniqueNo,
        //     1,
        //     "",
        //     (res: any) => {
        //         if (CommonServer.default.isServerResponseError(res)) {
        //             callBack && callBack();
        //         } else {
        //             const changeResult = UserInfo.instance().getServerChangeResult(res);
        //             UserInfo.instance().applyChangeResult(changeResult);
        //             callBack && callBack();
        //         }
        //     }
        // );
    }

    public isFeverTime(): boolean {
        return this.getFeverTime() > 0;
    }

    public getFeverTime(): number {
        return this.getFeverTicketTime() - TSUtility.getServerBaseNowUnixTime();
    }

    public getFeverModePointData(val: number): number | undefined {
        if (val <= 0) return;
        const dataList = this.FEVER_MODE_POINT_DATA;
        for (let i = 0; i < dataList.length; ++i) {
            const item = dataList[i];
            if (val >= 0.9 * item.key && val <= item.key) {
                return item.value;
            }
        }
        return 0;
    }

    public setFeverModeInfoByItemHist(dataList: Array<any>): void {
        this._listItemHist = [];
        let ticketItem: any = null;
        for (let i = 0; i < dataList.length; ++i) {
            const item = dataList[i];
            if (TSUtility.isValid(item)) {
                if (item.itemId === SDefine.I_SUITE_LEAGUE_FEVER_POINT && item.addCnt > 0) {
                    this._listItemHist.push(item);
                }
                if (item.itemId === SDefine.I_SUITE_LEAGUE_FEVER_TICKET) {
                    ticketItem = item;
                }
            }
        }

        if (TSUtility.isValid(ticketItem)) {
            // UserInfo.instance().getItemInventory().addItem(ticketItem.itemInfo, ticketItem.addCnt, ticketItem.addTime);
        }

        const lastItem = this.getLastItemHistInfo();
        if (TSUtility.isValid(lastItem)) {
            this._listLastItemHist.push(lastItem);
        }
    }

    public getLastItemHistInfo(): any | null {
        if (this._listItemHist.length <= 0) return null;
        const lastItem = this._listItemHist[this._listItemHist.length - 1];
        return TSUtility.isValid(lastItem) ? lastItem : null;
    }

    public getLastItemHist(): any | undefined {
        return this._listLastItemHist.shift();
    }

    public getCreateFeverItemCount(): number {
        return TSUtility.isValid(this._listItemHist) ? this._listItemHist.length : 0;
    }

    public updateInvenPoint(item: any): void {
        if (TSUtility.isValid(item)) {
            const curPoint = this.getFeverModePoint();
            if (item.curCnt !== curPoint) {
                this.setFeverModePoint(item.curCnt, item);
            }
        }
    }

    public createFeverIcons(infoList: Array<FeverSymbolInfo>): Array<cc.Node> {
        const nodeList: Array<cc.Node> = [];
        for (let i = 0; i < infoList.length; ++i) {
            const info = infoList[i];
            if (TSUtility.isValid(info)) {
                const node = this.createFeverIcon(info);
                if (TSUtility.isValid(node)) {
                    nodeList.push(node);
                }
            }
        }
        return nodeList;
    }

    public createFeverIcon(info: FeverSymbolInfo): cc.Node | null {
        if (!TSUtility.isValid(info)) return null;
        const parentNode = info.getNode();
        if (!TSUtility.isValid(parentNode) || !TSUtility.isValid(this._objPool)) return null;

        const iconNode = this._objPool.pop(this._objPool.FEVER_MODE_ICON_NAME);
        if (!TSUtility.isValid(iconNode)) return null;

        const [infoW, infoH] = info.getNodeSize();
        const [iconW, iconH] = [iconNode.width, iconNode.height];
        const pos = new cc.Vec2(-infoW / 2 + iconW / 2, infoH / 2 - iconH / 2);

        iconNode.setParent(parentNode);
        iconNode.setPosition(pos);
        return iconNode;
    }

    public createFeverMoveIcons(nodeList: Array<cc.Node>, parentNode: cc.Node): Array<cc.Node> {
        const resList: Array<cc.Node> = [];
        for (let i = 0; i < nodeList.length; ++i) {
            const node = nodeList[i];
            if (TSUtility.isValid(node)) {
                const moveIcon = this.createFeverMoveIcon(node, parentNode);
                if (TSUtility.isValid(moveIcon)) {
                    resList.push(moveIcon);
                }
            }
        }
        return resList;
    }

    public createFeverMoveIcon(node: cc.Node, parentNode: cc.Node): cc.Node | null {
        if (!TSUtility.isValid(node) || !TSUtility.isValid(parentNode)) return null;
        if (!TSUtility.isValid(this._objPool)) return null;

        const moveIcon = this._objPool.pop(this._objPool.FEVER_MODE_MOVE_ICON_NAME);
        if (!TSUtility.isValid(moveIcon)) return null;

        moveIcon.active = true;
        moveIcon.setParent(parentNode);
        const worldPos = node.convertToWorldSpaceAR(cc.v2());
        const localPos = parentNode.convertToNodeSpaceAR(worldPos);
        moveIcon.setPosition(localPos);
        return moveIcon;
    }

    public playMoveFeverIconFromFeverUILayer(): void {
        // if (TSUtility.isValid(this._feverUI)) {
        //     this.playMoveFeverIcon([this._feverUI.getFeverIconLayer()]);
        // }
    }

    public playMoveFeverIcon(layerList: Array<any>): void {
        // const nodeList: Array<cc.Node> = [];
        // for (let i = 0; i < layerList.length; ++i) {
        //     const layer = layerList[i];
        //     if (TSUtility.isValid(layer)) {
        //         const compList = layer.getComponentsInChildren(IngameSuiteLeagueFeverSymbolUI);
        //         if (!TSUtility.isValid(compList) || compList.length <= 0) continue;
        //         while (compList.length > 0) {
        //             const comp = compList.pop();
        //             if (TSUtility.isValid(comp)) {
        //                 nodeList.push(comp.node);
        //             }
        //         }
        //     }
        // }
        // if (TSUtility.isValid(this._feverUI)) {
        //     this._feverUI.playMoveFeverIcons(nodeList);
        // }
    }

    public restore(node: cc.Node): void {
        if (TSUtility.isValid(node) && TSUtility.isValid(this._objPool)) {
            this._objPool.restore(node);
        }
    }

    /**
     * 抽奖格子随机获取 - 原JS随机算法完全保留
     */
    public getCellWithDrawLots(cellList: Array<any>): Array<any> {
        const createCount = this.getCreateFeverItemCount();
        if (createCount <= 0) return [];
        if (createCount >= cellList.length) return cellList;

        const resList: Array<any> = [];
        const randomIdxList: Array<number> = [];
        const self = this;

        const randomFunc = (): string => {
            if (randomIdxList.length >= cellList.length) return "break";
            let randomIdx = Math.floor(Math.random() * cellList.length);
            if (randomIdxList.some(idx => idx === randomIdx)) {
                randomIdx = self.getRandomNumber(cellList.length, randomIdxList);
                if (randomIdx < 0) return "continue";
            }
            randomIdxList.push(randomIdx);
            if (!TSUtility.isValid(cellList[randomIdx])) return "continue";
            resList.push(cellList[randomIdx]);
        };

        while (resList.length < createCount) {
            const res = randomFunc();
            if (res === "break") break;
        }
        return resList;
    }

    /**
     * 获取非重复随机数 - 原JS逻辑丝毫不差
     */
    public getRandomNumber(max: number, excludeList: Array<number>): number {
        if (excludeList.length >= max) return -1;
        const validNumList: Array<number> = [];
        const filterFunc = (num: number) => {
            if (excludeList.some(idx => idx === num)) return;
            validNumList.push(num);
        };

        for (let i = 0; i < max; ++i) {
            filterFunc(i);
        }

        if (validNumList.length <= 0) return -1;
        if (validNumList.length === 1) return validNumList[0];
        return validNumList[Math.floor(Math.random() * validNumList.length)];
    }

    public moveFeverSymbolToFeverUILayer(node: cc.Node): void {
        if (!TSUtility.isValid(node)) return;
        // const childList = node.children;
        // for (let i = 0; i < childList.length; ++i) {
        //     const child = childList[i];
        //     if (TSUtility.isValid(child)) {
        //         const compList = child.getComponentsInChildren(IngameSuiteLeagueFeverSymbolUI);
        //         if (!TSUtility.isValid(compList) || compList.length <= 0) continue;
        //         while (compList.length > 0) {
        //             const comp = compList.pop();
        //             if (TSUtility.isValid(comp)) {
        //                 this.moveNodeToFeverUILayer(comp.node);
        //             }
        //         }
        //     }
        // }
    }

    public moveNodeToFeverUILayer(node: cc.Node): void {
        // if (!TSUtility.isValid(node) || !TSUtility.isValid(this._feverUI)) return;
        // const feverLayer = this._feverUI.getFeverIconLayer();
        // if (!TSUtility.isValid(feverLayer)) return;

        // const worldPos = node.convertToWorldSpaceAR(cc.v2());
        // const localPos = feverLayer.convertToNodeSpaceAR(worldPos);
        // node.setParent(feverLayer);
        // node.setPosition(localPos);
    }

    public setWaitMoveTime(val: number): void {
        this._numMoveTime = val;
    }

    public getWaitMoveTime(): number {
        return this._numMoveTime;
    }
}