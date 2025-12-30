import TSUtility from "./global_utility/TSUtility";

const {ccclass, property} = cc._decorator;

/** 对象池缓存项接口 - 键值对：预制体名称 -> 节点池 */
interface PoolCacheItem {
    key: string;
    value: cc.NodePool;
}

/** 尺寸缓存项接口 - 键值对：预制体名称 -> 节点尺寸 */
interface SizeCacheItem {
    key: string;
    value: cc.Size;
}


@ccclass
export default class LobbySlotObjectPool extends cc.Component {

// ===================== 私有成员变量 =====================
    /** 对象池缓存数组 - 所有老虎机Banner的节点池都存在这里 */
    private _arrObjectPool: PoolCacheItem[] = [];
    /** 预制体尺寸缓存数组 - 缓存已加载预制体的尺寸，避免重复获取 */
    private _arrSize: SizeCacheItem[] = [];

    private PREFAB_PATH = "Service/01_Lobby/SlotBanner/"
    private DYNAMIC_PREFAB_PATH = "SlotBanner/DynamicReels/"

    // ===================== 公有核心方法 =====================
    /**
     * 清空所有对象池的节点资源
     * 遍历所有池，调用节点自身的clear方法，然后清空池数组
     */
    public clear(): void {
        this._arrObjectPool.forEach(item => {
            const poolNode = item.value;
            if (TSUtility.isValid(poolNode)) {
                poolNode.clear();
            }
        });
        this._arrObjectPool = [];
    }

    /**
     * 获取指定预制体的尺寸 (带缓存，性能优化)
     * @param prefabName 预制体名称
     * @returns 预制体节点的尺寸 cc.Size
     */
    public getPrefabSize(prefabName: string): cc.Size {
        const targetPool = this.getObjectPool(prefabName);
        // 池无效/无节点，从缓存获取尺寸
        if (!TSUtility.isValid(targetPool) || targetPool.size() <= 0) {
            return this.getPrefabSizeFromCache(prefabName);
        }

        // 从池子里取出节点获取尺寸，然后立即归还
        const tempNode = targetPool.get();
        if (!TSUtility.isValid(tempNode)) {
            return this.getPrefabSizeFromCache(prefabName);
        }

        const nodeSize = tempNode.getContentSize();
        this.restore(tempNode);
        // 缓存尺寸，后续直接读取
        this._arrSize.push({ key: prefabName, value: nodeSize });
        return nodeSize;
    }

    /**
     * 从缓存中获取预制体尺寸
     * @param prefabName 预制体名称
     * @returns 缓存的尺寸，无缓存返回 cc.size(0,0)
     */
    public getPrefabSizeFromCache(prefabName: string): cc.Size {
        const sizeItem = this._arrSize.find(item => item.key === prefabName);
        return TSUtility.isValid(sizeItem) ? sizeItem.value : new cc.Size(0, 0);
    }

    /**
     * 获取指定预制体在对象池中的节点数量
     * @param prefabName 预制体名称
     * @returns 节点数量 number
     */
    public getPrefabCount(prefabName: string): number {
        const targetPool = this.getObjectPool(prefabName);
        return TSUtility.isValid(targetPool) ? targetPool.size() : 0;
    }

    /**
     * 批量预加载指定的所有预制体到对象池
     * @param prefabNameArr 预制体名称数组
     */
    public async preloadAllObject(prefabNameArr: string[]): Promise<void> {
        for (let i = 0; i < prefabNameArr.length; i++) {
            await this.preloadObject(prefabNameArr[i]);
        }
    }

    /**
     * 预加载单个预制体并加入对象池
     * @param prefabName 预制体名称
     */
    public async preloadObject(prefabName: string): Promise<void> {
        const newNode = await this.createObject(prefabName);
        if (TSUtility.isValid(newNode)) {
            await this.restore(newNode);
        }
    }

    /**
     * 从对象池中取出一个节点 (核心方法)
     * 优先级：先从池子里拿 → 池子空了再创建新节点
     * @param prefabName 预制体名称
     * @returns 可用的节点 cc.Node | null
     */
    public async pop(prefabName: string): Promise<cc.Node | null> {
        const targetPool = this.getObjectPool(prefabName);
        // 池有效且有节点，直接取出复用
        if (TSUtility.isValid(targetPool) && targetPool.size() > 0) {
            const poolNode = targetPool.get();
            if (TSUtility.isValid(poolNode)) {
                poolNode.active = true;
                return poolNode;
            }
        }
        // 池子无节点，创建新节点并返回
        return await this.createObject(prefabName);
    }

    /**
     * 回收节点到对象池 (核心方法)
     * 节点失效则销毁，有效则置为非激活并放回对应池子
     * @param targetNode 要回收的节点
     */
    public async restore(targetNode: cc.Node): Promise<void> {
        return new Promise<void>(resolve => {
            if (!TSUtility.isValid(targetNode)) {
                resolve();
                return;
            }
            // 节点回收前置处理：非激活 + 脱离父节点
            targetNode.active = false;
            if (TSUtility.isValid(targetNode.parent)) {
                targetNode.parent = null;
            }
            // 获取节点对应的对象池
            const targetPool = this.getObjectPool(targetNode.name);
            if (!targetPool) {
                targetNode.destroy();
                resolve();
                return;
            }
            // 放回对象池复用
            targetPool.put(targetNode);
            resolve();
        });
    }

    // ===================== 私有核心方法 =====================
    /**
     * 创建一个新的预制体节点 (异步加载+实例化)
     * 路径规则：预制体名称包含 _DY → 动态路径 | 否则 → 普通路径
     * @param prefabName 预制体名称
     * @returns 实例化后的节点 cc.Node | null
     */
    private async createObject(prefabName: string): Promise<cc.Node | null> {
        return new Promise<cc.Node | null>(resolve => {
            try {
                // 区分动态/普通预制体路径
                const loadPath = prefabName.includes("_DY") 
                    ? this.DYNAMIC_PREFAB_PATH 
                    : this.PREFAB_PATH;
                // 异步加载预制体并实例化
                cc.loader.loadRes(loadPath + prefabName, cc.Prefab, (err, prefab) => {
                    if (err) {
                        cc.log(`LobbySlotObjectPool - createObject: Error creating object. :${prefabName}`);
                        cc.error(err);
                        resolve(null);
                        return;
                    }
                    // 实例化节点并初始化状态
                    const newNode = cc.instantiate(prefab);
                    newNode.name = prefabName;
                    newNode.active = false;
                    if (TSUtility.isValid(newNode.parent)) {
                        newNode.removeFromParent(false);
                    }
                    resolve(newNode);
                });
            } catch (err) {
                cc.log(`LobbySlotObjectPool - createObject: Error creating object. :${prefabName}`);
                cc.error(err);
                resolve(null);
            }
        });
    }

    /**
     * 获取指定预制体对应的对象池，不存在则创建并加入缓存
     * @param prefabName 预制体名称
     * @returns 对应的节点池 cc.NodePool | null
     */
    private getObjectPool(prefabName: string): cc.NodePool | null {
        // 检查池是否已存在，不存在则创建新池并加入缓存
        const isPoolExist = this._arrObjectPool.some(item => item.key === prefabName);
        if (!isPoolExist) {
            this._arrObjectPool.push({
                key: prefabName,
                value: new cc.NodePool()
            });
        }
        // 查询并返回对应池
        const targetPoolItem = this._arrObjectPool.find(item => item.key === prefabName);
        return TSUtility.isValid(targetPoolItem) ? targetPoolItem.value : null;
    }
}
