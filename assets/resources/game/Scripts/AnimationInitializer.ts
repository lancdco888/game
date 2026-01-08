const { ccclass, property } = cc._decorator;

/**
 * 动画初始化组件
 * 功能：记录节点原始状态（位置/缩放/透明度/旋转/激活状态），组件禁用时恢复状态并重置动画
 */
@ccclass()
export default class AnimationInitializer extends cc.Component {
    /** 基础激活标识（控制节点初始激活状态） */
    @property({
        type: Boolean,
        displayName: '基础激活标识',
        tooltip: '组件加载时节点的初始激活状态'
    })
    public base_flag: boolean = false;

    /** 是否递归处理所有子节点 */
    @property({
        type: Boolean,
        displayName: '递归所有子节点',
        tooltip: 'true：处理当前节点下所有子节点；false：仅处理init_data中的指定节点'
    })
    public isAllChild: boolean = false;

    /** 需要初始化的动画组件列表 */
    @property({
        type: [cc.Animation],
        displayName: '初始化动画列表',
        tooltip: '需要重置到初始帧的动画组件'
    })
    public init_ani: cc.Animation[] = [];

    /** 需要记录状态的节点列表（非递归模式下生效） */
    @property({
        type: [cc.Node],
        displayName: '初始化节点列表',
        tooltip: '非递归模式下，需要记录/恢复状态的节点'
    })
    public init_data: cc.Node[] = [];

    // ========== 节点原始状态存储 ==========
    /** 原始位置数组 */
    private ori_pos: cc.Vec2[] = [];
    /** 原始缩放数组 */
    private ori_scale: cc.Vec2[] = [];
    /** 原始透明度数组 */
    private ori_opacity: number[] = [];
    /** 原始旋转角度数组 */
    private ori_rotation: number[] = [];
    /** 原始激活状态数组 */
    private ori_active: boolean[] = [];

    // ========== 生命周期 ==========
    onLoad(): void {
        // 根据是否递归，初始化节点状态记录
        if (this.isAllChild) {
            this.recursiveChild(this.node);
        } else {
            // 记录指定节点的原始状态
            this.init_data.forEach(node => {
                if (node) {
                    this.ori_pos.push(node.getPosition());
                    this.ori_scale.push(new cc.Vec2(node.scaleX, node.scaleY));
                    this.ori_opacity.push(node.opacity);
                    this.ori_rotation.push(node.angle);
                    this.ori_active.push(node.active);
                }
            });
        }

        // 设置节点初始激活状态
        this.node.active = this.base_flag;
    }

    onDisable(): void {
        // 组件禁用时，恢复所有节点状态并重置动画
        this.onInitialize();
    }

    // ========== 核心方法 ==========
    /**
     * 初始化（恢复节点原始状态 + 重置动画）
     */
    public onInitialize(): void {
        // 恢复节点原始状态
        this.init_data.forEach((node, index) => {
            if (!node) return;
            // 边界检查：避免索引越界
            if (index >= this.ori_pos.length || index >= this.ori_scale.length ||
                index >= this.ori_opacity.length || index >= this.ori_rotation.length ||
                index >= this.ori_active.length) {
                return;
            }

            // 恢复位置、缩放、透明度、旋转、激活状态
            node.setPosition(this.ori_pos[index]);
            node.setScale(this.ori_scale[index]);
            node.opacity = this.ori_opacity[index];
            node.angle = this.ori_rotation[index];
            node.active = this.ori_active[index];
        });

        // 重置动画到初始帧
        this.init_ani.forEach(aniComp => {
            if (!aniComp) return;
            
            if (aniComp.currentClip) {
                // 停止当前动画并重置到0秒
                aniComp.stop(aniComp.currentClip.name);
                aniComp.setCurrentTime(0, aniComp.currentClip.name);
            } else {
                // 无当前剪辑时直接停止动画
                aniComp.stop();
            }
        });
    }

    /**
     * 递归遍历子节点，记录所有子节点的原始状态
     * @param parentNode 父节点
     */
    public recursiveChild(parentNode: cc.Node): void {
        if (!parentNode || parentNode.children.length === 0) return;

        parentNode.children.forEach(childNode => {
            if (!childNode) return;
            
            // 递归处理子节点的子节点（深度优先）
            this.recursiveChild(childNode);
            
            // 记录当前子节点的原始状态
            this.init_data.push(childNode);
            this.ori_pos.push(childNode.getPosition());
            this.ori_scale.push(new cc.Vec2(childNode.scaleX, childNode.scaleY));
            this.ori_opacity.push(childNode.opacity);
            this.ori_rotation.push(childNode.angle);
            this.ori_active.push(childNode.active);
        });
    }
}