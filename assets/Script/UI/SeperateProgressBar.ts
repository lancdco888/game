import { Utility } from "../global_utility/Utility";

const { ccclass, property } = cc._decorator;

/**
 * 进度条手柄移动类型枚举 (与原JS枚举完全一致)
 * Move: 水平平移模式 | Radical: 旋转摆动模式
 */
export enum ProgressMoveType {
    Move = 0,
    Radical = 1
}

/**
 * 分段进度条的单段配置信息类 (序列化自定义类 - 编辑器可见可编辑)
 * 作用：配置每一段进度条的精灵、填充范围、占比权重
 */
@ccclass("SeperateInfo")
export class SeperateInfo {
    /** 当前分段的填充精灵 */
    @property(cc.Sprite)
    public targetImg: cc.Sprite = null!;

    /** 当前分段的最大填充范围 (0-1) */
    @property({ type: Number })
    public maxFillRange: number = 1;

    /** 当前分段的占比权重 */
    @property({ type: Number })
    public range: number = 1;
}

/**
 * 进度条手柄的移动配置信息类 (序列化自定义类 - 编辑器可见可编辑)
 * 作用：配置手柄的移动/旋转规则、点位、角度等参数
 */
@ccclass("HandleMoveInfo")
export class HandleMoveInfo {
    /** 手柄移动类型 */
    @property({ type: ProgressMoveType })
    public moveType: ProgressMoveType = ProgressMoveType.Move;

    /** 移动起始点位 */
    @property(cc.Vec2)
    public startPos: cc.Vec2 = cc.Vec2.ZERO;

    /** 移动结束点位 */
    @property(cc.Vec2)
    public endPos: cc.Vec2 = cc.Vec2.ZERO;

    /** 固定移动距离 */
    @property(cc.Vec2)
    public distance: cc.Vec2 = cc.Vec2.ZERO;

    /** 根节点起始旋转角度 */
    @property({ type: Number })
    public startRootRotation: number = 0;

    /** 根节点结束旋转角度 */
    @property({ type: Number })
    public endRootRotation: number = 0;

    /** 手柄自身旋转角度 */
    @property({ type: Number })
    public angle: number = 0;

    /** 当前配置的占比权重 */
    @property({ type: Number })
    public range: number = 0;

    /** 绑定的目标根节点 */
    @property(cc.Node)
    public targetRoot: cc.Node = null!;
}

/**
 * 分离式分段进度条核心组件
 * 核心特性：支持多段式精灵填充进度 + 手柄双模式(平移/旋转)跟随进度、被 LoadingProgressBar 作为备用进度条调用
 * 适配场景：异形/非规则的进度条UI，无法用原生ProgressBar实现的分段填充效果
 */
@ccclass("SeperateProgressBar")
export default class SeperateProgressBar extends cc.Component {
    // ====================== Cocos 序列化绑定属性 - 编辑器拖拽赋值 ======================
    /** 分段进度条的配置信息数组【核心】 */
    @property([SeperateInfo])
    public infos: SeperateInfo[] = [];

    /** 手柄的根节点 */
    @property(cc.Node)
    public handleRoot: cc.Node = null!;

    /** 手柄的显示节点 */
    @property(cc.Node)
    public handle: cc.Node = null!;

    /** 手柄的移动配置信息数组【核心】 */
    @property([HandleMoveInfo])
    public handleInfos: HandleMoveInfo[] = [];

    // ====================== 成员属性 ======================
    /** 当前进度值 (0-1) */
    private _progress: number = 0;

    // ====================== 生命周期 ======================
    onLoad(): void {
        this.calcNormalizeRange();
    }

    // ====================== 核心公共方法（供外部调用，LoadingProgressBar 调用） ======================
    /** 获取当前进度值 */
    public getProgress(): number {
        return this._progress;
    }

    /**
     * 设置进度值 核心方法【100%保留原JS逻辑】
     * @param value 目标进度值 (0-1)
     * 核心逻辑：1.分段填充进度条精灵 2.根据进度匹配手柄的移动/旋转规则 3.边界值安全处理
     */
    public setProgress(value: number): void {
        // 边界值安全处理：进度最大不超过1
        const progress = Math.min(1, value);
        this._progress = progress;

        // ========== 第一部分：处理分段进度条的填充逻辑 ==========
        let totalRange = 0;
        for (let i = 0; i < this.infos.length; i++) {
            const info = this.infos[i];
            const currentRange = info.range;
            // 进度超过当前分段的总占比 → 该分段完全填充
            if (progress > totalRange + currentRange) {
                info.targetImg.node.active = true;
                info.targetImg.fillRange = info.maxFillRange;
            }
            // 进度落在当前分段区间内 → 按比例插值填充
            else if (progress > totalRange) {
                info.targetImg.node.active = true;
                const fillRatio = (progress - totalRange) / currentRange;
                info.targetImg.fillRange = fillRatio * info.maxFillRange;
            }
            // 进度未到当前分段 → 隐藏分段+清空填充
            else {
                info.targetImg.node.active = false;
                info.targetImg.fillRange = 0;
            }
            totalRange += currentRange;
        }

        // ========== 第二部分：处理手柄的移动/旋转逻辑 ==========
        if (this.handle) {
            let handleTotalRange = 0;
            for (let i = 0; i < this.handleInfos.length; i++) {
                const handleInfo = this.handleInfos[i];
                const currentRange = handleInfo.range;
                
                // 同步手柄根节点的锚点与位置
                this.handleRoot.setPosition(handleInfo.targetRoot.position);
                this.handleRoot.setAnchorPoint(handleInfo.targetRoot.getAnchorPoint());

                // 进度落在当前手柄配置区间内 → 执行对应移动/旋转逻辑
                if (progress >= handleTotalRange && progress < handleTotalRange + currentRange) {
                    const moveRatio = (progress - handleTotalRange) / currentRange;
                    if (handleInfo.moveType === ProgressMoveType.Move) {
                        // 平移模式：两点之间线性插值计算位置
                        Utility.setRotation(this.handleRoot, 0);
                        this.handle.setPosition(handleInfo.startPos.lerp(handleInfo.endPos, moveRatio));
                    } else {
                        // 旋转模式：根节点旋转角度插值 + 手柄固定位置 + 自身角度旋转
                        const lerpRotation = cc.misc.lerp(handleInfo.startRootRotation, handleInfo.endRootRotation, moveRatio);
                        Utility.setRotation(this.handleRoot, lerpRotation);
                        this.handle.setPosition(handleInfo.distance);
                    }
                    // 设置手柄自身的固定旋转角度
                    Utility.setRotation(this.handle, handleInfo.angle);
                    return;
                }
                handleTotalRange += currentRange;
            }
        }
    }

    // ====================== 私有核心方法 ======================
    /**
     * 归一化处理所有分段/手柄的占比权重
     * 原JS核心逻辑：计算总权重，将各分段的权重转为0-1的比例，防止总权重为0导致的计算异常
     */
    private calcNormalizeRange(): void {
        // 归一化 分段进度条的权重
        let totalInfoRange = 0;
        for (let i = 0; i < this.infos.length; i++) {
            totalInfoRange += this.infos[i].range;
        }
        // 总权重为0时 抛出异常日志，强制设为1避免除零错误
        if (this.infos.length > 0 && totalInfoRange === 0) {
            cc.error("SeperateProgressBar -> invalid totRange");
            totalInfoRange = 1;
        }
        // 重新计算各分段的归一化权重
        for (let i = 0; i < this.infos.length; i++) {
            this.infos[i].range = this.infos[i].range / totalInfoRange;
        }

        // 归一化 手柄配置的权重
        if (this.handle) {
            let totalHandleRange = 0;
            for (let i = 0; i < this.handleInfos.length; i++) {
                totalHandleRange += this.handleInfos[i].range;
            }
            // 重新计算各手柄配置的归一化权重
            for (let i = 0; i < this.handleInfos.length; i++) {
                this.handleInfos[i].range = this.handleInfos[i].range / totalHandleRange;
            }
        }
    }
}