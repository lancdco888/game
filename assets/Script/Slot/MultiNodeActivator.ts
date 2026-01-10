const { ccclass, property } = cc._decorator;

// 导入项目依赖
import TSUtility from "../global_utility/TSUtility";

/** 子节点分组类 - 原JS内部u类 1:1还原 */
@ccclass('MultiNode')
export class MultiNode {
    @property([cc.Node])
    public nodes: cc.Node[] = [];

    /** 播放：激活本组所有节点 */
    public play(): void {
        this.nodes.forEach(node => {
            if (node) node.active = true;
        });
    }

    /** 停止：关闭本组节点(排除指定节点) */
    public stop(excludeNodes: cc.Node[]): void {
        this.nodes.forEach(node => {
            if (node && excludeNodes.indexOf(node) === -1) {
                node.active = false;
            }
        });
    }
}

/** 多节点分组激活控制器 - 主类 */
@ccclass()
export default class MultiNodeActivator extends cc.Component {
    // ===================== 编辑器序列化属性 (与原JS配置完全一致) =====================
    @property({
        serializable: true,
        override: true,
        type: [MultiNode]
    })
    public multis: MultiNode[] = [];

    // ===================== 私有成员属性 =====================
    private _currentPlayIndex: number = 0;

    // ===================== 核心方法 =====================
    /** 添加节点到对应分组 */
    public addNodes(indexArr: number[], nodeArr: cc.Node[]): void {
        if (indexArr.length <= 0 || indexArr.length !== nodeArr.length) return;
        
        for (let i = 0; i < indexArr.length; i++) {
            if (indexArr[i] > this.multis.length) return;
        }

        for (let i = 0; i < indexArr.length; i++) {
            this.multis[indexArr[i]].nodes.push(nodeArr[i]);
        }
    }

    /** 从对应分组移除节点 */
    public removeNodes(indexArr: number[], nodeArr: cc.Node[]): void {
        if (indexArr.length <= 0 || indexArr.length !== nodeArr.length) return;
        
        for (let i = 0; i < indexArr.length; i++) {
            if (indexArr[i] > this.multis.length) return;
        }

        for (let i = 0; i < this.multis.length; i++) {
            for (let j = 0; j < this.multis[indexArr[i]].nodes.length; j++) {
                if (this.multis[indexArr[i]].nodes[j] === nodeArr[i]) {
                    this.multis[indexArr[i]].nodes.splice(j, 1);
                }
            }
        }
    }

    /** 播放指定索引的分组特效 - 核心方法 */
    public playEffect(playIndex: number): void {
        if (this.multis.length === 0) return;

        // 索引越界报错
        if (playIndex >= this.multis.length || playIndex < 0) {
            cc.error("MultiNodeActivator playEffect out of index ", playIndex);
            return;
        }

        this._currentPlayIndex = playIndex;
        const targetGroup = this.multis[this._currentPlayIndex];
        
        // 校验分组有效性
        if (TSUtility.isValid(targetGroup) && TSUtility.isValid(targetGroup.nodes)) {
            // 停用其他所有分组，保留当前分组节点激活
            for (let i = 0; i < this.multis.length; ++i) {
                if (i !== this._currentPlayIndex) {
                    this.multis[i].stop(targetGroup.nodes);
                }
            }
            // 激活当前分组
            targetGroup.play();
        } else {
            cc.error("playEffect is invalid ", playIndex);
        }
    }
}