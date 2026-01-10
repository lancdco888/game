import { Utility } from "./Utility";

const { ccclass } = cc._decorator;

/** 粒子颜色数据体 - 对应原JS particleColor */
export class particleColor {
    public r: number = 0;
    public g: number = 0;
    public b: number = 0;
    public a: number = 0;
}

/** 粒子重力模式物理参数 (对应原JS ParticleModeA) */
export class ParticleModeA {
    public dir: cc.Vec2 = cc.Vec2.ZERO;
    public radialAccel: number = 0;
    public tangentialAccel: number = 0;
}

/** 粒子半径模式物理参数 (对应原JS ParticleModeB) */
export class ParticleModeB {
    public angle: number = 0;
    public degreesPerSecond: number = 0;
    public radius: number = 0;
    public deltaRadius: number = 0;
}

/** 单个粒子的核心渲染与逻辑控制器 - 粒子系统的最小单元 */
@ccclass()
export default class NodeParticle extends cc.Component {
    // ===================== 粒子运行时核心属性 1:1还原原JS =====================
    public pos: cc.Vec2 = cc.Vec2.ZERO;
    public startPos: cc.Vec2 = cc.Vec2.ZERO;
    public color: particleColor = new particleColor();
    public deltaColor: particleColor = new particleColor();
    public size: number = 0;
    public deltaSize: number = 0;
    public rotation: number = 0;
    public deltaRotation: number = 0;
    public timeToLive: number = 0;
    public drawPos: number = 0;
    public modeA: ParticleModeA | null = null;
    public modeB: ParticleModeB | null = null;

    // ===================== 核心方法 =====================
    /** 初始化粒子基础颜色与透明度 */
    public init(): void {
        const nodeColor = this.node.color;
        nodeColor.setR(this.color.r);
        nodeColor.setG(this.color.g);
        nodeColor.setB(this.color.b);
        this.node.color = nodeColor;
        this.node.opacity = this.color.a;
    }

    /** 更新粒子的 坐标/旋转/缩放 核心渲染属性 */
    public updateAll(): void {
        this.node.setPosition(this.pos);
        Utility.setRotation(this.node, this.rotation);
        this.node.setScale(this.size, this.size);
    }

    /** 逐帧更新粒子的颜色渐变与透明度渐变 */
    public updateDeltaColor(dt: number): void {
        const nodeColor = this.node.color;
        // 逐帧叠加颜色增量
        this.color.r += this.deltaColor.r * dt;
        this.color.g += this.deltaColor.g * dt;
        this.color.b += this.deltaColor.b * dt;
        this.color.a += this.deltaColor.a * dt;
        // 同步到节点颜色
        nodeColor.setR(this.color.r);
        nodeColor.setG(this.color.g);
        nodeColor.setB(this.color.b);
        this.node.color = nodeColor;
        // 同步到节点透明度
        this.node.opacity = this.color.a;
    }
}
