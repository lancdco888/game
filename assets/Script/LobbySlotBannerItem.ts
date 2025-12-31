// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class LobbySlotBannerItem extends cc.Component {

    private _info: SlotInfo = null;
    private _remove: (() => void) = null;
    private _isInitialized: boolean = false;
    private _nodeRoot: cc.Node = null;

    public get nodeRoot(): cc.Node {
        return this._nodeRoot;
    }

    public get info(): SlotInfo {
        return this._info;
    }

    public get type(): any {
        return this._info?.type;
    }

    public setData(info: SlotInfo, remove: () => void): void {
        this._info = info;
        this._remove = remove;
        
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._nodeRoot = this.node.getChildByName("Root");
            this.initialize();
        }
        
        this.unscheduleAllCallbacks();
        this.refresh();
    }

    public remove(): void {
        if (TSUtility?.isValid(this._remove)) {
            this._remove!();
        }
    }

    protected initialize(): void {
        // 子类重写
    }

    protected refresh(): void {
        // 子类重写
    }

    public playOpenAction(): void {
        // 子类重写
    }

    protected createSlotBanner(prefab: cc.Node, parent: cc.Node): SlotBannerItem {
        const node = cc.instantiate(prefab);
        parent.addChild(node);
        node.setPosition(cc.v2(0, 0));
        return node.getComponent(SlotBannerItem);
    }

    protected setSlotBannerInfo(info: any, banner: SlotBannerItem): void {
        if (TSUtility?.isValid(banner)) {
            banner!.setLocation("lobby");
            banner!.initialize(info, this.type);
        }
    }

    protected isSlotArrayEqual(arr1: any[], arr2: any[]): boolean {
        if (!TSUtility?.isValid(arr1) || !TSUtility?.isValid(arr2)) {
            return false;
        }
        
        if (arr1.length !== arr2.length) {
            return false;
        }
        
        for (let i = 0; i < arr1.length; i++) {
            if (TSUtility?.isValid(arr1[i].strSlotID) && 
                TSUtility?.isValid(arr2[i].strSlotID) && 
                arr1[i].strSlotID !== arr2[i].strSlotID) {
                return false;
            }
        }
        
        return true;
    }
}
