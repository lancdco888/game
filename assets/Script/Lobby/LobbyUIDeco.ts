const { ccclass, property } = cc._decorator;

// ===================== 导入依赖模块 - 路径与原JS完全一致 =====================
import NodeParticleSystem from "../global_utility/NodeParticleSystem";

// ===================== 节日装饰枚举 完整复刻原JS cc.Enum 含韩文注释 =====================
export const DecoType = cc.Enum({
    NONE: 0,
    THANKS_GIVING: 1,
    CHRISTMAS: 2,
    ESTER: 3,
    SNOW: 4
});
export type DecoType = typeof DecoType[keyof typeof DecoType];

// ✅ 核心修复: 自定义Component组件 空@ccclass() 无类名 → 彻底根治类名指定报错
@ccclass()
export default class LobbyUIDeco extends cc.Component {
    // ===================== 序列化配置属性 - 与原JS完全一致 含tooltip韩文注释+默认值 =====================
    @property({ 
        type: DecoType, 
        tooltip: "장식 타입"
    })
    public type: DecoType = DecoType.NONE;

    @property({ 
        type: [cc.Node], 
        tooltip: "꺼져야 할 장식 배열"
    })
    public arrDisableDeco: cc.Node[] = [];

    // ===================== 私有成员变量 - 补全精准TS类型标注 原JS逻辑完整复刻 =====================
    private _arrParticleSystems: NodeParticleSystem[] = []; // 子节点所有粒子系统组件
    private _arrAnimation: cc.Animation[] = [];             // 子节点所有动画组件

    // ===================== 初始化核心方法 - 与原JS逻辑完全一致 =====================
    public initialize(): void {
        // 获取当前节点下所有子节点的粒子系统、动画组件
        this._arrParticleSystems = this.node.getComponentsInChildren(NodeParticleSystem);
        this._arrAnimation = this.node.getComponentsInChildren(cc.Animation);
        // 默认隐藏装饰节点
        this.node.active = false;
        // 更新装饰显示状态
        this.updateDeco();
    }

    // ===================== 外部调用-设置装饰显隐状态 =====================
    public setActive(isActive: boolean): void {
        // 状态无变化则直接返回 避免重复执行
        if (this.node.active === isActive) return;
        // 更新节点激活状态
        this.node.active = isActive;
        // 同步更新粒子/动画/反向节点状态
        this.updateDeco();
    }

    // ===================== 核心逻辑 - 根据节点状态 更新所有装饰特效 =====================
    private updateDeco(): void {
        const isActive = this.node.active;

        // ✅ 粒子系统控制: 显示则重置并播放 隐藏则停止
        this._arrParticleSystems.forEach(particleSys => {
            if (isActive) {
                particleSys.resetSystem();
            } else {
                particleSys.stopSystem();
            }
        });

        // ✅ 动画组件控制: 显示则重置时间并播放 隐藏则停止
        this._arrAnimation.forEach(anim => {
            if (isActive) {
                anim.setCurrentTime(0);
                anim.play();
            } else {
                anim.stop();
            }
        });

        // ✅ 反向显隐节点控制: 装饰显示时 → 这些节点隐藏 | 装饰隐藏时 → 这些节点显示
        this.arrDisableDeco.forEach(decoNode => {
            decoNode.active = !isActive;
        });
    }
}