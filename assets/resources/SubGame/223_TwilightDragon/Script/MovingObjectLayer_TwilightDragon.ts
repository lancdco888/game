import SlotSoundController from "../../../../Script/Slot/SlotSoundController";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）移动对象层管理类
 * 继承自 cc.Component，管控普通道具、免费旋转奖励、Orb 球体的实例化、动画与移除
 */
@ccclass("MovingObjectLayer_TwilightDragon")
export default class MovingObjectLayer_TwilightDragon extends cc.Component {
    // ======================================
    // Cocos 编辑器可绑定属性（对应原 JS 中的 c 装饰器）
    // ======================================
    /** 普通移动对象预制体（基础模式道具） */
    @property(cc.Prefab)
    public movingObject: cc.Prefab = null;

    /** 免费旋转模式移动对象预制体（Orb 球体） */
    @property(cc.Prefab)
    public movingObject_FS: cc.Prefab = null;

    /** 免费旋转奖励对象预制体（闪电特效奖励） */
    @property(cc.Prefab)
    public freeSpinPaytoutObject: cc.Prefab = null;

    /** 免费旋转模式层节点（承载免费旋转相关对象） */
    @property(cc.Node)
    public freeSpinLayer: cc.Node = null;

    /** 底部目标节点（预留，原逻辑未使用完整） */
    @property(cc.Node)
    public targetBottom: cc.Node = null;

    /** 接收节点（奖励对象落地节点） */
    @property(cc.Node)
    public receiveNode: cc.Node = null;

    /** Orb 球体目标节点数组（Orb 移动的目标位置） */
    @property({ type: [cc.Node] })
    public orbTargetNodes: cc.Node[] = [];

    // ======================================
    // 核心方法：创建普通移动对象（基础模式）
    // ======================================
    public createObject(
        xIndex: number, 
        yIndex: number, 
        callback: () => void
    ): void {
        // 判空：预制体未绑定则直接执行回调
        if (!this.movingObject) {
            callback();
            return;
        }

        // 1. 实例化预制体并添加到当前节点
        const objNode = cc.instantiate(this.movingObject);
        this.node.addChild(objNode);

        // 2. 设置对象初始坐标
        objNode.x = 284 * (xIndex - 1);
        objNode.y = 91 * (1 - yIndex);

        // 3. 构建动作序列：缓动移动 → 执行回调
        const moveAction = cc.moveTo(0.67, 0, 0).easing(cc.easeIn(3));
        const callbackAction = cc.callFunc(() => {
            callback();
        });
        const actionSeq = cc.sequence(moveAction, callbackAction);

        // 4. 运行动作序列
        objNode.runAction(actionSeq);
    }

    // ======================================
    // 核心方法：创建免费旋转奖励对象（闪电特效）
    // ======================================
    public createObjectFreeSpinPayout(
        xIndex: number, 
        yIndex: number, 
        isSpecial: number, 
        callback: () => void
    ): void {
        // 判空：预制体未绑定则直接执行回调
        if (!this.freeSpinPaytoutObject || !this.freeSpinLayer || !this.receiveNode) {
            callback();
            return;
        }

        // 1. 实例化预制体并添加到免费旋转层
        const payoutNode = cc.instantiate(this.freeSpinPaytoutObject);
        this.freeSpinLayer.addChild(payoutNode);

        // 2. 设置对象初始坐标
        payoutNode.x = 175 * (xIndex - 1);
        payoutNode.y = 111 * (1 - yIndex) - 20;

        // 3. 选择并播放动画剪辑（随机选择）
        const animClips = isSpecial === 1 
            ? ["Fx_Lightning_Count_J1", "Fx_Lightning_Count_J2", "Fx_Lightning_Count_J3"]
            : ["Fx_Lightning_Count1", "Fx_Lightning_Count2", "Fx_Lightning_Count3"];
        const randomIndex = Math.floor(Math.random() * animClips.length);
        const payoutAnim = payoutNode.getComponent(cc.Animation);
        if (payoutAnim) {
            payoutAnim.play(animClips[randomIndex], 0);
        }

        // 4. 设置对象旋转角度与缩放比例（原逻辑固定数组）
        const posIndex = 3 * xIndex + yIndex;
        const rotationArr = [10, 14, 28, 35, 46, 65, 51, 62, 75];
        const scaleArr = [1.08, 0.72, 0.38, 1.3, 1.0, 0.82, 1.68, 1.48, 1.35];
        if (posIndex >= 0 && posIndex < rotationArr.length) {
            payoutNode.setRotation(rotationArr[posIndex]);
            payoutNode.setScale(scaleArr[posIndex]);
        }

        // 5. 激活接收节点（触发落地特效）
        this.receiveNode.active = false;
        this.receiveNode.active = true;

        // 6. 延迟 1 秒移除子节点，执行回调
        this.scheduleOnce(() => {
            payoutNode.removeAllChildren();
        }, 1);
        callback();
    }

    // ======================================
    // 核心方法：创建 Orb 球体对象（免费旋转模式）
    // ======================================
    public createOrbObject(
        xIndex: number, 
        yIndex: number, 
        targetIndex: number, 
        callback: () => void
    ): void {
        // 判空：预制体/目标节点不合法则直接执行回调
        if (
            !this.movingObject_FS || 
            !this.freeSpinLayer ||
            targetIndex < 0 || 
            targetIndex >= this.orbTargetNodes.length ||
            !this.orbTargetNodes[targetIndex]
        ) {
            callback();
            return;
        }

        // 1. 实例化 Orb 预制体并添加到免费旋转层
        const orbNode = cc.instantiate(this.movingObject_FS);
        this.freeSpinLayer.addChild(orbNode);

        // 2. 设置 Orb 初始坐标与缩放
        orbNode.x = 175 * (xIndex - 1);
        orbNode.y = 111 * (1 - yIndex);
        orbNode.scale = 0.8;

        // 3. 获取目标节点坐标，计算移动时间（保证移动速度一致）
        const targetNode = this.orbTargetNodes[targetIndex];
        const targetX = targetNode.x;
        const targetY = targetNode.y;
        let moveTime = (Math.abs(targetX - orbNode.x) + Math.abs(targetY - orbNode.y)) / 500 * 0.28;
        moveTime = Math.max(moveTime, 0.28); // 最小移动时间 0.28 秒

        // 4. 播放 Orb 移动音效
        SlotSoundController.Instance().playAudio("OrbMove", "FX");

        // 5. 构建动作序列：延迟 → 缓动移动 → 移除节点 → 执行回调
        const delayAction = cc.delayTime(0.17);
        const moveAction = cc.moveTo(moveTime, targetX, targetY);
        const callbackAction = cc.callFunc(() => {
            orbNode.removeFromParent();
            callback();
        });
        const actionSeq = cc.sequence(delayAction, moveAction, callbackAction);

        // 6. 并行运行：缩放动作 + 移动动作序列
        orbNode.runAction(cc.scaleTo(moveTime, 0.5));
        orbNode.runAction(actionSeq);
    }

    // ======================================
    // 核心方法：移除所有普通移动对象
    // ======================================
    public removeObject(): void {
        this.node.removeAllChildren();
    }
}