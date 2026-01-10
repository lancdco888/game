import NodeParticleSystem from "./global_utility/NodeParticleSystem";

const { ccclass } = cc._decorator;

/**
 * 激活时播放粒子组件
 * 组件启用（onEnable）时自动重置并播放粒子系统（内置ParticleSystem + 自定义NodeParticleSystem）
 */
@ccclass()
export default class PlayParticleOnActive extends cc.Component {
    /**
     * 组件启用生命周期函数
     * 核心逻辑：重置并启动粒子系统（优先检查内置ParticleSystem，再检查自定义NodeParticleSystem）
     */
    onEnable(): void {
        // 1. 获取并重置 Cocos 内置粒子系统
        const builtinParticleSys = this.getComponent(cc.ParticleSystem);
        if (builtinParticleSys != null) {
            builtinParticleSys.resetSystem();
        }

        // 2. 获取并重置自定义 NodeParticleSystem
        const customParticleSys = this.getComponent(NodeParticleSystem);
        if (customParticleSys != null) {
            customParticleSys.resetSystem();
        }
    }
}