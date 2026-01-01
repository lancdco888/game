const {ccclass, property} = cc._decorator;

/**
 * 自适应配置信息类 - 序列化可配置
 * 作用：绑定【适配Key】+【需要适配的节点数组】+【目标缩放值】+【目标Y轴位移值】
 * 在编辑器中可视化配置，一个Key对应一组节点的适配规则
 */
@ccclass
export class AutoScalingInfo {
    /** 适配分组唯一标识Key */
    @property({ displayName: "适配Key", tooltip: "分组唯一标识，通过该Key获取适配因子" })
    public key: string = "";

    /** 该分组下需要做自适应缩放/位移的节点数组 */
    @property({ type: [cc.Node], displayName: "适配节点数组", tooltip: "需要做缩放和位移适配的节点" })
    public nodes: cc.Node[] = [];

    /** 目标缩放系数：分辨率偏离基准时的最终缩放值，线性插值(1 -> scale) */
    @property({ displayName: "目标缩放值", tooltip: "适配的目标缩放系数，默认1", min: 0.1, max: 2.0 })
    public scale: number = 1;

    /** 目标Y轴位移值：分辨率偏离基准时的最终Y轴位移值，线性插值(0 -> posY) */
    @property({ displayName: "目标Y位移", tooltip: "适配的目标Y轴位移，默认0" })
    public posY: number = 0;

    /** 原始Y轴位置信息缓存 (原代码定义，暂未使用，保留兼容) */
    public orignalPosYInfos: any[] = [];
}

@ccclass
export default class AutoScalingAdjuster extends cc.Component {

    // ===================== 序列化可配置属性 =====================
    /** 所有自适应配置信息数组，在编辑器中添加/配置每组节点的适配规则 */
    @property({ type: [AutoScalingInfo], displayName: "适配规则列表", tooltip: "配置不同Key的节点适配规则" })
    public infos: AutoScalingInfo[] = [];

    // ===================== 私有成员变量 =====================
    /** 分辨率适配比例系数 [0,1] ：0=标准9:16比例，1=最大偏离比例，核心计算值 */
    private _ratio: number = 0;

    // ===================== 公有核心方法 =====================
    /**
     * 初始化分辨率适配比例系数【核心方法】
     * 必须在启动时调用，计算当前画布的宽高比与标准9:16的偏离度，得到适配系数_ratio
     * 计算公式 100% 还原原代码：(画布高/画布宽 - 9/16) / 0.1875
     * 最终_ratio被钳制在 [0,1] 区间，防止过度适配导致UI变形
     */
    public initRatio(): void {
        // 获取Canvas画布的实际尺寸
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas)?.node;
        const canvasSize: cc.Size = canvasNode ? canvasNode.getContentSize() : new cc.Size(720, 1280);
        // 核心适配公式 - 原代码精准还原
        const ratioCalc = (canvasSize.height / canvasSize.width - 9 / 16) / 0.1875;
        // 钳制在0~1之间，避免过度适配
        this._ratio = cc.misc.clamp01(ratioCalc);
    }

    /**
     * 获取当前计算好的分辨率适配比例系数
     * @returns 适配系数 [0,1]
     */
    public getResolutionRatio(): number {
        return this._ratio;
    }

    /**
     * 根据适配Key，获取该分组的【缩放因子】
     * 核心插值逻辑：cc.misc.lerp(1, targetScale, ratio) → 从标准缩放1 过渡到 目标缩放scale
     * @param key 适配分组Key
     * @returns 插值后的最终缩放值 number
     */
    public getScaleFactor(key: string): number {
        const targetInfo = this.infos.find(info => info.key === key);
        return targetInfo ? cc.misc.lerp(1, targetInfo.scale, this._ratio) : 1;
    }

    /**
     * 根据适配Key，手动设置该分组的目标缩放值
     * @param key 适配分组Key
     * @param scale 新的目标缩放值
     */
    public setScaleFactor(key: string, scale: number): void {
        const targetInfo = this.infos.find(info => info.key === key);
        if (targetInfo) {
            targetInfo.scale = scale;
        }
    }

    /**
     * 根据适配Key，获取该分组的【Y轴位移因子】
     * 核心插值逻辑：cc.misc.lerp(0, targetPosY, ratio) → 从标准位移0 过渡到 目标位移posY
     * @param key 适配分组Key
     * @returns 插值后的最终Y轴位移值 number
     */
    public getPosYFactor(key: string): number {
        const targetInfo = this.infos.find(info => info.key === key);
        return targetInfo ? cc.misc.lerp(0, targetInfo.posY, this._ratio) : 0;
    }

    /**
     * 根据适配Key，获取该分组第一个节点的Y轴坐标（作为基准锚点）
     * 原代码默认返回 -250，无匹配Key/无节点时使用该默认值
     * @param key 适配分组Key
     * @returns 第一个节点的Y坐标 number
     */
    public getPivotPosY(key: string): number {
        const targetInfo = this.infos.find(info => info.key === key);
        if (targetInfo && targetInfo.nodes.length > 0) {
            return targetInfo.nodes[0].y;
        }
        return -250;
    }
}
