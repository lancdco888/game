const { ccclass, property } = cc._decorator;
import NodeParticle, { ParticleModeA, ParticleModeB } from "./NodeParticle";
import { Utility } from "./Utility";

@ccclass()
export default class NodeParticleSystem extends cc.Component {
    // ====== 编辑器可配置属性 (和原生粒子系统一致) ======
    @property(NodeParticle)
    public template: NodeParticle = null!;

    @property
    public duration: number = -1;

    @property
    public emissionRate: number = 10;

    @property
    public life: number = 1;

    @property
    public lifeVar: number = 0;

    @property
    public totalParticles: number = 0;

    @property(cc.Color)
    public startColor: cc.Color = cc.Color.WHITE;

    @property(cc.Color)
    public startColorVar: cc.Color = cc.Color.TRANSPARENT;

    @property(cc.Color)
    public endColor: cc.Color = cc.Color.WHITE;

    @property(cc.Color)
    public endColorVar: cc.Color = cc.Color.TRANSPARENT;

    @property
    public angle: number = 0;

    @property
    public angleVar: number = 0;

    @property
    public startSize: number = 0;

    @property
    public startSizeVar: number = 0;

    @property
    public endSize: number = 0;

    @property
    public endSizeVar: number = 0;

    @property
    public startSpin: number = 0;

    @property
    public startSpinVar: number = 0;

    @property
    public endSpin: number = 0;

    @property
    public endSpinVar: number = 0;

    @property(cc.Vec2)
    public sourcePos: cc.Vec2 = cc.Vec2.ZERO;

    @property(cc.Vec2)
    public posVar: cc.Vec2 = cc.Vec2.ZERO;

    @property({ type: cc.ParticleSystem.PositionType })
    public positionType: cc.ParticleSystem.PositionType = cc.ParticleSystem.PositionType.RELATIVE;

    @property({ type: cc.ParticleSystem.EmitterMode })
    public emitterMode: cc.ParticleSystem.EmitterMode = cc.ParticleSystem.EmitterMode.GRAVITY;

    @property(cc.Vec2)
    public gravity: cc.Vec2 = cc.Vec2.ZERO;

    @property
    public speed: number = 0;

    @property
    public speedVar: number = 0;

    @property
    public tangentialAccel: number = 0;

    @property
    public tangentialAccelVar: number = 0;

    @property
    public radialAccel: number = 0;

    @property
    public radialAccelVar: number = 0;

    @property
    public rotationIsDir: boolean = false;

    @property
    public startRadius: number = 0;

    @property
    public startRadiusVar: number = 0;

    @property
    public endRadius: number = 0;

    @property
    public endRadiusVar: number = 0;

    @property
    public rotatePerSecond: number = 0;

    @property
    public rotatePerSecondVar: number = 0;

    // ====== 私有内部属性 (强类型注解) ======
    private _isActive: boolean = false;
    private _particles: NodeParticle[] = [];
    private _totalParticles: number = 0;
    private _emitCounter: number = 0;
    public particleCount: number = 0;
    private _elapsed: number = 0;
    private _particleIdx: number = 0;
    private _init: boolean = false;

    // 静态临时向量池 (避免频繁创建Vec2，优化性能)
    public static readonly TemporaryPoints: cc.Vec2[] = [
        new cc.Vec2(0, 0), new cc.Vec2(0, 0), new cc.Vec2(0, 0), new cc.Vec2(0, 0)
    ];

    onLoad(): void {
        this.initWithTotalParticles(this.totalParticles);
    }

    preLoad(): void {
        this.initWithTotalParticles(this.totalParticles);
    }

    update(dt: number): void {
        if (!this._isActive || !this.emissionRate) return;

        const emitInterval = 1 / this.emissionRate;
        // 按发射频率创建粒子
        if (this.particleCount < this._totalParticles) {
            this._emitCounter += dt;
            while (this.particleCount < this._totalParticles && this._emitCounter > emitInterval) {
                this.addParticle();
                this._emitCounter -= emitInterval;
            }
        }

        // 累计运行时间，超过duration则停止发射
        this._elapsed += dt;
        if (this.duration !== -1 && this.duration < this._elapsed) {
            this.stopSystem();
        }

        this._particleIdx = 0;
        const worldMat = cc.mat4();
        this.node.getWorldMatrix(worldMat);

        // 计算粒子基准位置
        const basePos = NodeParticleSystem.TemporaryPoints[0];
        if (this.positionType === cc.ParticleSystem.PositionType.FREE) {
            Utility.pIn(basePos, this.node.convertToWorldSpaceAR(cc.Vec2.ZERO));
        } else if (this.positionType === cc.ParticleSystem.PositionType.RELATIVE) {
            basePos.x = this.node.position.x;
            basePos.y = this.node.position.y;
        }

        const vec1 = NodeParticleSystem.TemporaryPoints[1];
        const vec2 = NodeParticleSystem.TemporaryPoints[2];
        const vec3 = NodeParticleSystem.TemporaryPoints[3];
        const particles = this._particles;

        // 更新所有存活粒子
        while (this._particleIdx < this.particleCount) {
            Utility.pZeroIn(vec1);
            Utility.pZeroIn(vec2);
            Utility.pZeroIn(vec3);

            const particle = particles[this._particleIdx];
            particle.timeToLive -= dt;

            if (particle.timeToLive > 0) {
                // 重力模式 - 核心物理逻辑
                if (this.emitterMode === cc.ParticleSystem.EmitterMode.GRAVITY) {
                    const accel = vec3;
                    const dir = vec1;
                    const tanAccel = vec2;

                    if (particle.pos.x !== 0 || particle.pos.y !== 0) {
                        Utility.pIn(dir, particle.pos);
                        Utility.pNormalizeIn(dir);
                    } else {
                        Utility.pZeroIn(dir);
                    }

                    Utility.pIn(tanAccel, dir);
                    Utility.pMultIn(dir, particle.modeA!.radialAccel);

                    // 切向加速度 向量正交旋转
                    const tempX = tanAccel.x;
                    tanAccel.x = -tanAccel.y;
                    tanAccel.y = tempX;
                    Utility.pMultIn(tanAccel, particle.modeA!.tangentialAccel);

                    Utility.pIn(accel, dir);
                    Utility.pAddIn(accel, tanAccel);
                    Utility.pAddIn(accel, this.gravity);
                    Utility.pMultIn(accel, dt);
                    Utility.pAddIn(particle.modeA!.dir, accel);

                    Utility.pIn(accel, particle.modeA!.dir);
                    Utility.pMultIn(accel, dt);
                    Utility.pAddIn(particle.pos, accel);
                } 
                // 半径模式 - 圆周运动逻辑
                else {
                    const modeB = particle.modeB!;
                    modeB.angle += modeB.degreesPerSecond * dt;
                    modeB.radius += modeB.deltaRadius * dt;
                    particle.pos.x = -Math.cos(modeB.angle) * modeB.radius;
                    particle.pos.y = -Math.sin(modeB.angle) * modeB.radius;
                }

                // 更新粒子颜色、大小、旋转
                particle.updateDeltaColor(dt);
                particle.size += particle.deltaSize * dt;
                particle.size = Math.max(0, particle.size);
                particle.rotation += particle.deltaRotation * dt;

                // 计算粒子最终显示位置
                const showPos = vec1;
                if (this.positionType === cc.ParticleSystem.PositionType.FREE) {
                    const worldNodePos = vec2;
                    const worldStartPos = vec3;
                    this._pointApplyAffineTransformIn(basePos, worldMat, worldNodePos);
                    this._pointApplyAffineTransformIn(particle.startPos, worldMat, worldStartPos);
                    Utility.pSubIn(worldNodePos, worldStartPos);
                    Utility.pIn(showPos, particle.pos);
                    Utility.pSubIn(showPos, worldNodePos);
                } else if (this.positionType === cc.ParticleSystem.PositionType.RELATIVE) {
                    Utility.pIn(showPos, particle.pos);
                }

                particle.updateAll();
                this._particleIdx++;
            } 
            // 粒子生命周期结束，回收粒子
            else {
                if (this._particleIdx !== this.particleCount - 1) {
                    const temp = particles[this._particleIdx];
                    particles[this._particleIdx] = particles[this.particleCount - 1];
                    particles[this.particleCount - 1] = temp;
                    temp.node.active = false;
                } else {
                    particle.node.active = false;
                }
                this.particleCount--;
            }
        }
    }

    /** 矩阵变换：将点应用到仿射矩阵中，计算世界坐标 */
    private _pointApplyAffineTransformIn(x: number | cc.Vec2, mat: any | number, out: cc.Vec2, opt?: cc.Vec2): void {
        let a: number, b: number, matrix: any;
        if (opt === undefined) {
            matrix = mat as cc.Mat4;
            const p = x as cc.Vec2;
            a = p.x;
            b = p.y;
            opt = out;
        } else {
            a = x as number;
            b = mat as number;
            matrix = out as unknown as cc.Mat4;
        }
        const res = opt as cc.Vec2;
        res.x = matrix.a * a + matrix.c * b + matrix.tx;
        res.y = matrix.b * a + matrix.d * b + matrix.ty;
    }

    /** 无时间增量的更新（强制刷新粒子状态） */
    updateWithNoTime(): void {
        this.update(0);
    }

    /** 停止粒子系统发射，现有粒子继续播放完生命周期 */
    stopSystem(): void {
        this._isActive = false;
        this._elapsed = this.duration;
        this._emitCounter = 0;
    }

    /** 重置粒子系统，重新开始发射 */
    resetSystem(): void {
        this._isActive = true;
        this._elapsed = 0;
        this._emitCounter = 0;
        this._particles.forEach(p => {
            if (p && p.node) p.node.active = false;
        });
        this.particleCount = 0;
    }

    /** 判断粒子池是否已满 */
    isFull(): boolean {
        return this.particleCount >= this._totalParticles;
    }

    /** 初始化粒子池，创建指定数量的粒子对象 */
    initWithTotalParticles(count: number): void {
        if (this._init) return;
        this._init = true;
        this._totalParticles = count;
        if (!this.template || !this.template.node) return;
        
        this.template.node.active = false;
        this._particles.length = count;

        // 创建粒子对象池
        for (let i = 0; i < count; i++) {
            const particleNode = cc.instantiate(this.template.node);
            particleNode.active = false;
            this._particles[i] = particleNode.getComponent(NodeParticle)!;
            this.node.addChild(particleNode);
        }

        Utility.shuffle(this._particles); // 打乱粒子顺序，避免发射规律化
        this._isActive = true;
    }

    /** 添加单个粒子并初始化 */
    addParticle(): boolean {
        if (this.isFull()) return false;
        const particle = this._particles[this.particleCount];
        this.initParticle(particle);
        particle.node.active = true;
        this.particleCount++;
        return true;
    }

    /** 初始化单个粒子的所有属性和状态 */
    initParticle(particle: NodeParticle): void {
        const rand = Utility.randomMinus1To1;
        // 生命周期
        particle.timeToLive = this.life + this.lifeVar * rand();
        particle.timeToLive = Math.max(0, particle.timeToLive);
        // 初始位置
        particle.pos.x = this.sourcePos.x + this.posVar.x * rand();
        particle.pos.y = this.sourcePos.y + this.posVar.y * rand();

        // 颜色初始化 + 颜色插值计算
        const startR = Utility.clampf(this.startColor.r + this.startColorVar.r * rand(), 0, 255);
        const startG = Utility.clampf(this.startColor.g + this.startColorVar.g * rand(), 0, 255);
        const startB = Utility.clampf(this.startColor.b + this.startColorVar.b * rand(), 0, 255);
        const startA = Utility.clampf(this.startColor.a + this.startColorVar.a * rand(), 0, 255);
        particle.color = { r: startR, g: startG, b: startB, a: startA };

        const endR = Utility.clampf(this.endColor.r + this.endColorVar.r * rand(), 0, 255);
        const endG = Utility.clampf(this.endColor.g + this.endColorVar.g * rand(), 0, 255);
        const endB = Utility.clampf(this.endColor.b + this.endColorVar.b * rand(), 0, 255);
        const endA = Utility.clampf(this.endColor.a + this.endColorVar.a * rand(), 0, 255);
        
        const deltaColor = particle.deltaColor;
        const ttl = particle.timeToLive;
        deltaColor.r = (endR - startR) / ttl;
        deltaColor.g = (endG - startG) / ttl;
        deltaColor.b = (endB - startB) / ttl;
        deltaColor.a = (endA - startA) / ttl;

        // 大小初始化 + 大小插值计算
        const startSize = Math.max(0, this.startSize + this.startSizeVar * rand());
        particle.size = startSize;
        const endSize = Math.max(0, this.endSize + this.endSizeVar * rand());
        particle.deltaSize = (endSize - startSize) / ttl;

        // 旋转初始化 + 旋转插值计算
        const startSpin = this.startSpin + this.startSpinVar * rand();
        const endSpin = this.endSpin + this.endSpinVar * rand();
        particle.rotation = startSpin;
        particle.deltaRotation = (endSpin - startSpin) / ttl;

        // 初始位置记录（用于坐标偏移计算）
        if (this.positionType === cc.ParticleSystem.PositionType.FREE) {
            particle.startPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        } else if (this.positionType === cc.ParticleSystem.PositionType.RELATIVE) {
            particle.startPos.x = this.node.position.x;
            particle.startPos.y = this.node.position.y;
        }

        // 粒子角度（弧度）
        const particleAngle = Utility.degreesToRadians(this.angle + this.angleVar * rand());

        // 重力模式初始化
        if (this.emitterMode === cc.ParticleSystem.EmitterMode.GRAVITY) {
            const speed = this.speed + this.speedVar * rand();
            particle.modeA = new ParticleModeA();
            particle.modeA.dir.x = Math.cos(particleAngle);
            particle.modeA.dir.y = Math.sin(particleAngle);
            Utility.pMultIn(particle.modeA.dir, speed);
            particle.modeA.radialAccel = this.radialAccel + this.radialAccelVar * rand();
            particle.modeA.tangentialAccel = this.tangentialAccel + this.tangentialAccelVar * rand();
        } 
        // 半径模式初始化
        else {
            particle.modeB = new ParticleModeB();
            const startRadius = this.startRadius + this.startRadiusVar * rand();
            const endRadius = this.endRadius + this.endRadiusVar * rand();
            particle.modeB.radius = startRadius;
            particle.modeB.deltaRadius = this.endRadius === cc.ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS 
                ? 0 
                : (endRadius - startRadius) / ttl;
            particle.modeB.angle = particleAngle;
            particle.modeB.degreesPerSecond = Utility.degreesToRadians(this.rotatePerSecond + this.rotatePerSecondVar * rand());
        }

        particle.init();
    }
}