import TSUtility from "../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * 多组件激活单元类
 * 核心职责：管理一组节点，提供指定组件的启用/禁用能力
 */
class MultiComponent {
    /** 管理的节点数组 */
    @property([cc.Node])
    public nodes: cc.Node[] = [];

    /**
     * 启用指定名称的组件
     * @param compName 要启用的组件名称
     */
    play(compName: string): void {
        this.nodes.forEach(node => {
            if (!node) return;
            
            // 获取指定名称的组件并启用
            const comp = node.getComponent(compName);
            if (comp) {
                comp.enabled = true;
            }
        });
    }

    /**
     * 禁用非目标节点中指定名称的组件
     * @param targetNodes 目标节点数组（这些节点的组件不会被禁用）
     * @param compName 要禁用的组件名称
     */
    stop(targetNodes: cc.Node[], compName: string): void {
        this.nodes.forEach(node => {
            if (!node || targetNodes.includes(node)) return;
            
            // 获取指定名称的组件并禁用
            const comp = node.getComponent(compName);
            if (comp) {
                comp.enabled = false;
            }
        });
    }
}

/**
 * 多组件激活器（核心组件）
 * 核心职责：
 * 1. 管理多个MultiComponent单元，支持批量添加/移除节点
 * 2. 根据索引激活指定单元的组件，停用其他单元的组件
 */
@ccclass()
export default class MultiComponentActivator extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 多组件激活单元数组 */
    @property({
        serializable: true,    // 序列化（保留原配置）
        override: true,        // 覆盖（保留原配置）
        type: [MultiComponent] // 类型为MultiComponent数组
    })
    public multis: MultiComponent[] = [];

    /** 要激活/禁用的组件名称 */
    @property()
    public compName: string = "";

    // ====== 私有状态属性 ======
    /** 当前播放的索引 */
    private _currentPlayIndex: number = 0;

    // ====== 核心方法 ======
    /**
     * 批量添加节点到指定索引的MultiComponent单元
     * @param indexes 目标索引数组
     * @param nodes 要添加的节点数组
     */
    addNodes(indexes: number[], nodes: cc.Node[]): void {
        // 校验数组长度（不能为空且长度一致）
        if (indexes.length <= 0 || indexes.length !== nodes.length) return;

        // 校验索引范围（不能超过multis数组长度）
        for (const index of indexes) {
            if (index > this.multis.length) return;
        }

        // 批量添加节点到对应索引的MultiComponent单元
        for (let i = 0; i < indexes.length; i++) {
            const targetIndex = indexes[i];
            const targetNode = nodes[i];
            
            if (this.multis[targetIndex]) {
                this.multis[targetIndex].nodes.push(targetNode);
            }
        }
    }

    /**
     * 批量从指定索引的MultiComponent单元移除节点
     * @param indexes 目标索引数组
     * @param nodes 要移除的节点数组
     */
    removeNodes(indexes: number[], nodes: cc.Node[]): void {
        // 校验数组长度（不能为空且长度一致）
        if (indexes.length <= 0 || indexes.length !== nodes.length) return;

        // 校验索引范围（不能超过multis数组长度）
        for (const index of indexes) {
            if (index > this.multis.length) return;
        }

        // 批量移除节点
        for (let o = 0; o < this.multis.length; o++) {
            const multiUnit = this.multis[o];
            if (!multiUnit) continue;

            for (let a = 0; a < indexes.length; a++) {
                const targetIndex = indexes[a];
                const targetNode = nodes[a];
                
                // 找到节点并删除
                const nodeIndex = multiUnit.nodes.findIndex(node => node === targetNode);
                if (nodeIndex !== -1) {
                    multiUnit.nodes.splice(nodeIndex, 1);
                }
            }
        }
    }

    /**
     * 根据索引播放对应效果（激活指定组件，停用其他组件）
     * @param index 目标索引
     */
    playEffect(index: number): void {
        // 校验multis数组是否为空
        if (this.multis.length === 0) return;

        // 索引越界校验
        if (index >= this.multis.length || index < 0) {
            cc.error("MultiNodeActivator playEffect out of index ", index);
            return;
        }

        // 更新当前播放索引
        this._currentPlayIndex = index;

        // 校验当前索引的MultiComponent单元是否有效
        const currentMulti = this.multis[this._currentPlayIndex];
        if (!TSUtility.isValid(currentMulti) || !TSUtility.isValid(currentMulti.nodes)) {
            cc.error("playEffect is invalid ", index);
            return;
        }

        // 1. 停用所有非当前索引的组件
        for (let t = 0; t < this.multis.length; ++t) {
            if (t !== this._currentPlayIndex && this.multis[t]) {
                this.multis[t].stop(currentMulti.nodes, this.compName);
            }
        }

        // 2. 激活当前索引的组件
        currentMulti.play(this.compName);
    }
}