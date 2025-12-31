
const { ccclass } = cc._decorator;

import TSUtility from "./global_utility/TSUtility";
import SlotBannerItem from "./SlotBannerItem";

@ccclass('LobbySlotBannerItem')
export default class LobbySlotBannerItem extends cc.Component {
    private _info: any = null;
    private _remove: Function | null = null;
    private _isInitialized: boolean = false;
    private _nodeRoot: cc.Node | null = null;

    get nodeRoot() {
        return this._nodeRoot;
    }

    get info() {
        return this._info;
    }

    get type() {
        return this.info.type;
    }

    public setData(e: any, t: Function): void {
        this._info = e;
        this._remove = t;
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._nodeRoot = this.node.getChildByName("Root");
            this.initialize();
        }
        this.unscheduleAllCallbacks();
        this.refresh();
    }

    public remove(): void {
        TSUtility.isValid(this._remove) && this._remove!();
    }

    public initialize(): void { }

    public refresh(): void { }

    public playOpenAction(): void { }

    public createSlotBanner(e: cc.Node, t: cc.Node): SlotBannerItem | null {
        const n = cc.instantiate(e);
        t.addChild(n);
        n.setPosition(cc.v3(0, 0, 0)); // Vec2 转 Vec3 完成 ✔️
        return n.getComponent(SlotBannerItem);
    }

    public setSlotBannerInfo(e: any, t: any): void {
        TSUtility.isValid(t) && (t.setLocation("lobby"), t.initialize(e, this.type));
    }

    public isSlotArrayEqual(e: any[], t: any[]): boolean {
        if (!TSUtility.isValid(e) || !TSUtility.isValid(t)) return false;
        if (e.length !== t.length) return false;
        for (let n = 0; n < e.length; n++) {
            if (TSUtility.isValid(e[n].strSlotID) && TSUtility.isValid(t[n].strSlotID) && e[n].strSlotID !== t[n].strSlotID) {
                return false;
            }
        }
        return true;
    }
}