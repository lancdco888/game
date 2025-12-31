const { ccclass } = cc._decorator;

// 导入项目依赖模块 (路径与原JS完全一致，无需修改)
import TSUtility from "./global_utility/TSUtility";
import SlotBannerItem from "./SlotBannerItem";

@ccclass('LobbySlotBannerItem')
export default class LobbySlotBannerItem extends cc.Component {
    // ===================== 私有内部属性 (强类型注解) =====================
    private _info: any = null;
    private _remove: Function = null;
    private _isInitialized: boolean = false;
    private _nodeRoot: cc.Node = null;

    // ===================== Getter 属性访问器 (与原JS完全一致) =====================
    public get nodeRoot(): cc.Node  {
        return this._nodeRoot;
    }

    public get info(): any {
        return this._info;
    }

    public get type(): any {
        return this.info?.type;
    }

    // ===================== 核心方法：设置Banner数据 =====================
    public setData(info: any, removeCallback: Function): void {
        this._info = info;
        this._remove = removeCallback;

        // 初始化节点 & 根节点绑定 (只执行一次)
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._nodeRoot = this.node.getChildByName("Root");
            this.initialize();
        }

        this.unscheduleAllCallbacks();
        this.refresh();
    }

    // ===================== 核心方法：执行移除回调 =====================
    public remove(): void {
        if (TSUtility.isValid(this._remove)) {
            this._remove!();
        }
    }

    // ===================== 钩子方法：初始化 (空实现 子类重写) =====================
    public initialize(): void { }

    // ===================== 钩子方法：刷新UI (空实现 子类重写) =====================
    public refresh(): void { }

    // ===================== 钩子方法：播放打开动画 (空实现 子类重写) =====================
    public playOpenAction(): void { }

    // ===================== 核心方法：创建老虎机Banner节点 (✅ Vec2 → Vec3 已替换) =====================
    public createSlotBanner(prefab: cc.Node, parentNode: cc.Node): SlotBannerItem {
        const bannerNode = cc.instantiate(prefab);
        parentNode.addChild(bannerNode);
        bannerNode.setPosition(cc.v3(0, 0, 0)); // ✅ 原cc.v2(0,0) → 改为cc.v3(0,0,0) 完美适配
        return bannerNode.getComponent(SlotBannerItem);
    }

    // ===================== 核心方法：设置Banner节点数据 =====================
    public setSlotBannerInfo(info: any, bannerItem: any): void {
        if (TSUtility.isValid(bannerItem)) {
            bannerItem!.setLocation("lobby");
            bannerItem!.initialize(info, this.type);
        }
    }

    // ===================== 核心方法：对比两个老虎机数组是否一致 (原逻辑完整保留) =====================
    public isSlotArrayEqual(arr1: any[], arr2: any[]): boolean {
        // 空值判断
        if (!TSUtility.isValid(arr1) || !TSUtility.isValid(arr2)) {
            return false;
        }
        // 长度不一致直接返回false
        if (arr1.length !== arr2.length) {
            return false;
        }
        // 遍历对比每一项的strSlotID
        for (let i = 0; i < arr1.length; i++) {
            const slot1 = arr1[i];
            const slot2 = arr2[i];
            if (TSUtility.isValid(slot1.strSlotID) && TSUtility.isValid(slot2.strSlotID)) {
                if (slot1.strSlotID !== slot2.strSlotID) {
                    return false;
                }
            }
        }
        return true;
    }
}