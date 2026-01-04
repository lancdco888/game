// Cocos Creator 2.x 标准头部解构写法 (严格按要求置顶)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import TSUtility from "./global_utility/TSUtility";
import UIScrollViewItem from "./UIScrollViewItem";
import LobbyUI_SlotScrollView from "./LobbyUI_SlotScrollView";
import LobbySlotBannerInfo, { SlotBannerType } from "./LobbySlotBannerInfo";
import LobbySlotBannerItem from "./LobbySlotBannerItem";


/**
 * 老虎机横幅容器组件 - 继承滚动列表项基类
 * 核心作用：滚动列表中单个横幅的容器，负责 横幅数据绑定、预制体对象池加载/回收、节点生命周期管理
 */
@ccclass
export default class SlotBannerContainer extends UIScrollViewItem {
    // ===================== 私有成员变量 (原代码全部保留，补全完整TS类型注解) =====================
    private _info: LobbySlotBannerInfo = null;
    private _eType: typeof SlotBannerType = SlotBannerType.NONE;
    private _banner: LobbySlotBannerItem = null;

    // ===================== 只读属性getter (原代码保留，外部只读访问横幅组件) =====================
    public get banner(): LobbySlotBannerItem {
        return this._banner;
    }

    // ===================== 核心重写方法 - 设置列表项数据，入口方法 =====================
    public setData(): void {
        // 获取滚动列表项绑定的数据
        this._info = this.getData() as LobbySlotBannerInfo;
        // 数据无效校验
        if (!TSUtility.isValid(this._info)) {
            this._eType = SlotBannerType.NONE;
            this._banner = null;
            return;
        }
        // 赋值横幅类型 + 加载对应预制体
        this._eType = this._info.type;
        this.loadPrefab(this._eType);
    }

    // ===================== 核心异步方法 - 清理当前容器资源，回收至对象池 =====================
    public async clear(): Promise<void> {
        // 横幅组件有效 → 回收节点到对象池
        if (TSUtility.isValid(this._banner)) {
            await LobbyUI_SlotScrollView.Instance.objectPool.restore(this._banner.node);
        }
    }

    // ===================== 核心异步方法 - 加载对应类型的横幅预制体 (对象池核心逻辑) =====================
    public async loadPrefab(type: typeof SlotBannerType): Promise<void> {
        // 已有横幅组件 → 先回收至对象池
        if (TSUtility.isValid(this._banner)) {
            await LobbyUI_SlotScrollView.Instance.objectPool.restore(this._banner.node);
        }

        // 从对象池中取出对应类型的预制体节点
        const poolNode = await LobbyUI_SlotScrollView.Instance.objectPool.pop(type);
        // 对象池取出节点无效 → 直接返回
        if (!TSUtility.isValid(poolNode)) {
            return;
        }

        // 取出的节点类型与目标类型不匹配 → 回收并返回
        if (poolNode.name !== type) {
            await LobbyUI_SlotScrollView.Instance.objectPool.restore(poolNode);
            return;
        }

        // 获取横幅组件实例
        this._banner = poolNode.getComponent(LobbySlotBannerItem);
        if (!TSUtility.isValid(this._banner)) {
            return;
        }

        // 清空当前容器的所有子节点并回收至对象池
        let childNode: cc.Node = null;
        while (this.node.children.length > 0) {
            childNode = this.node.children.shift();
            if (TSUtility.isValid(childNode)) {
                await LobbyUI_SlotScrollView.Instance.objectPool.restore(childNode);
            }
        }

        // 挂载横幅节点到容器 + 重置位置 + 激活显示
        this._banner.node.parent = this.node;
        this._banner.node.setPosition(0, 0);
        this._banner.node.active = true;
        
        // 给横幅组件赋值数据 + 绑定移除节点回调
        this._banner.setData(this._info, this.removeNode.bind(this));
    }

    // ===================== 横幅移除回调方法 (给子组件调用) =====================
    public removeNode(): void {
        this.clear();
    }
}