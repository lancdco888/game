const { ccclass, property } = cc._decorator;

/**
 * 自定义按钮组件 - 支持多状态切换+动画/龙骨/粒子特效联动
 * 支持 常态/悬浮/按下/禁用 四种状态，区分移动端/桌面端交互逻辑
 */
@ccclass
export default class CustomButton extends cc.Component {
    // ====================== Cocos 序列化属性【编辑器赋值】 ======================
    @property({ type: cc.Node, displayName: "常态节点" })
    public normal: cc.Node = null;

    @property({ type: cc.Node, displayName: "悬浮节点" })
    public hover: cc.Node = null;

    @property({ type: cc.Node, displayName: "按下节点" })
    public pressed: cc.Node = null;

    @property({ type: cc.Node, displayName: "禁用节点" })
    public disabled: cc.Node = null;

    @property({ type: cc.Boolean, displayName: "是否播放特效" })
    public isShowEffect: boolean = true;

    // ====================== 私有成员变量 ======================
    private buttonComponent: cc.Button = null;
    private interactable: boolean = true;
    
    // 按钮状态切换回调
    private _onButtonVisibleState: ((state: string) => void) | null = null;

    // 事件回调函数 - 区分移动端/桌面端
    private _mouseEnterCallback: Function | null = null;
    private _mouseLeaveCallback: Function | null = null;
    private _touchStartCallback: Function | null = null;
    private _touchEndCallback: Function | null = null;
    private _touchCancelCallback: Function | null = null;

    // ====================== 生命周期 ======================
    onEnable(): void {
        this.buttonComponent = this.getComponent(cc.Button);
        if (!this.buttonComponent) {
            cc.error(`CustomButton: 当前节点【${this.node.name}】未挂载cc.Button组件`);
            return;
        }

        // 初始化按钮默认状态
        if (this.buttonComponent.interactable) {
            this.setButtonVisibleState("normal");
            this.interactable = true;
        } else {
            this.setButtonVisibleState("disabled");
            this.interactable = false;
        }

        // 清空旧的回调引用
        this.clearAllCallback();
        // 绑定交互事件
        this.bindTouchMouseEvent();
    }

    onDisable(): void {
        // 解绑所有事件，防止内存泄漏
        this.unbindTouchMouseEvent();
        // 清空回调引用
        this.clearAllCallback();
    }

    /**
     * 帧末更新 - 同步原生Button组件的交互状态（防止外部修改Button的interactable不同步）
     */
    lateUpdate(): void {
        if (!this.buttonComponent) return;
        if (this.interactable !== this.buttonComponent.interactable) {
            this.interactable = this.buttonComponent.interactable;
            if (!this.interactable) {
                this.setButtonVisibleState("disabled", false);
            } else {
                this.setButtonVisibleState("normal");
            }
        }
    }

    // ====================== 对外暴露核心方法 ======================
    /**
     * 设置按钮是否可交互 (核心调用方法)
     * @param isInteractable true=可点击 false=禁用
     */
    public setInteractable(isInteractable: boolean): void {
        this.setButtonVisibleState(isInteractable ? "normal" : "disabled", false);
        this.interactable = isInteractable;
        if (this.buttonComponent) {
            this.buttonComponent.interactable = isInteractable;
        }
    }

    /**
     * 设置按钮状态切换的回调函数
     * @param callback 回调方法，入参为当前状态字符串：normal/hover/pressed/disabled
     */
    public setOnButtonStateCallback(callback: (state: string) => void): void {
        this._onButtonVisibleState = callback;
    }

    /**
     * 主动触发鼠标移入效果
     */
    public mouseEnter(): void {
        if (this.interactable) {
            this.setButtonVisibleState("hover");
        }
    }

    /**
     * 主动触发鼠标移出效果
     */
    public mouseLeave(): void {
        if (this.interactable) {
            this.setButtonVisibleState("normal");
        }
    }

    /**
     * 测试点击方法
     */
    public testClick(): void {
        cc.log("click button");
    }

    // ====================== 内部核心逻辑方法 ======================
    /**
     * 隐藏所有状态节点
     */
    private hideAllComponents(): void {
        if (this.normal) {
            this.normal.active = false;
            this.stopAllEffects(this.normal);
        }
        if (this.hover) {
            this.hover.active = false;
            this.stopAllEffects(this.hover);
        }
        if (this.pressed) {
            this.pressed.active = false;
            this.stopAllEffects(this.pressed);
        }
        if (this.disabled) {
            this.disabled.active = false;
            this.stopAllEffects(this.disabled);
        }
    }

    /**
     * 设置按钮显示的状态
     * @param state 状态名 normal/hover/pressed/disabled
     * @param isCheckInteractable 是否校验交互状态，默认true
     */
    private setButtonVisibleState(state: string, isCheckInteractable: boolean = true): void {
        // 禁用状态下 强制不响应状态切换
        if (isCheckInteractable && !this.interactable) return;

        // 隐藏所有状态 再显示目标状态
        this.hideAllComponents();
        switch (state) {
            case "normal":
                this.showNodeWithEffect(this.normal);
                break;
            case "hover":
                this.showNodeWithEffect(this.hover);
                break;
            case "pressed":
                this.showNodeWithEffect(this.pressed);
                break;
            case "disabled":
                this.showNodeWithEffect(this.disabled);
                break;
        }

        // 执行状态切换回调
        if (this._onButtonVisibleState) {
            this._onButtonVisibleState(state);
        }
    }

    /**
     * 显示节点并根据配置播放特效
     */
    private showNodeWithEffect(node: cc.Node | null): void {
        if (!node) return;
        node.active = true;
        if (this.isShowEffect) {
            this.playAllEffect(node);
        }
    }

    /**
     * 停止节点上所有的特效(动画/龙骨/粒子)
     * @param targetNode 目标节点
     */
    private stopAllEffects(targetNode: cc.Node): void {
        const animations = targetNode.getComponentsInChildren(cc.Animation);
        const skeletons = targetNode.getComponentsInChildren(sp.Skeleton);
        const particles = targetNode.getComponentsInChildren(cc.ParticleSystem);

        // 追加节点自身的组件
        const selfAni = targetNode.getComponent(cc.Animation);
        selfAni && animations.push(selfAni);
        const selfSkel = targetNode.getComponent(sp.Skeleton);
        selfSkel && skeletons.push(selfSkel);
        const selfParticle = targetNode.getComponent(cc.ParticleSystem);
        selfParticle && particles.push(selfParticle);

        // 停止所有动画
        animations.forEach(ani => ani.stop());
        // 禁用所有龙骨动画
        skeletons.forEach(skel => skel.enabled = false);
        // 重置所有粒子系统
        particles.forEach(particle => particle.resetSystem());
    }

    /**
     * 播放节点上所有的特效(动画/龙骨/粒子)
     * @param targetNode 目标节点
     */
    private playAllEffect(targetNode: cc.Node): void {
        const animations = targetNode.getComponentsInChildren(cc.Animation);
        const skeletons = targetNode.getComponentsInChildren(sp.Skeleton);
        const particles = targetNode.getComponentsInChildren(cc.ParticleSystem);

        // 追加节点自身的组件
        const selfAni = targetNode.getComponent(cc.Animation);
        selfAni && animations.push(selfAni);
        const selfSkel = targetNode.getComponent(sp.Skeleton);
        selfSkel && skeletons.push(selfSkel);
        const selfParticle = targetNode.getComponent(cc.ParticleSystem);
        selfParticle && particles.push(selfParticle);

        // 播放所有动画
        animations.forEach(ani => ani.play());
        // 启用所有龙骨动画
        skeletons.forEach(skel => skel.enabled = true);
        // 重置并播放所有粒子系统
        particles.forEach(particle => particle.resetSystem());
    }

    /**
     * 绑定触控/鼠标事件 - 区分移动端/桌面端
     */
    private bindTouchMouseEvent(): void {
        const self = this;
        if (cc.sys.isMobile) {
            // 移动端 - 只绑定触摸事件
            this._touchStartCallback = () => self.setButtonVisibleState("pressed");
            this._touchEndCallback = () => self.setButtonVisibleState("normal");
            this._touchCancelCallback = () => self.setButtonVisibleState("normal");
            
            this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartCallback);
            this.node.on(cc.Node.EventType.TOUCH_END, this._touchEndCallback);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelCallback);
        } else {
            // 桌面端 - 绑定鼠标+触摸事件
            this._mouseEnterCallback = () => self.setButtonVisibleState("hover");
            this._mouseLeaveCallback = () => self.setButtonVisibleState("normal");
            this._touchStartCallback = () => self.setButtonVisibleState("pressed");
            this._touchEndCallback = () => self.setButtonVisibleState("hover");

            this.node.on(cc.Node.EventType.MOUSE_ENTER, this._mouseEnterCallback);
            this.node.on(cc.Node.EventType.MOUSE_LEAVE, this._mouseLeaveCallback);
            this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartCallback);
            this.node.on(cc.Node.EventType.TOUCH_END, this._touchEndCallback);
        }
    }

    /**
     * 解绑所有触控/鼠标事件
     */
    private unbindTouchMouseEvent(): void {
        if (cc.sys.isMobile) {
            this.node.off(cc.Node.EventType.TOUCH_START, this._touchStartCallback);
            this.node.off(cc.Node.EventType.TOUCH_END, this._touchEndCallback);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelCallback);
        } else {
            this.node.off(cc.Node.EventType.MOUSE_ENTER, this._mouseEnterCallback);
            this.node.off(cc.Node.EventType.MOUSE_LEAVE, this._mouseLeaveCallback);
            this.node.off(cc.Node.EventType.TOUCH_START, this._touchStartCallback);
            this.node.off(cc.Node.EventType.TOUCH_END, this._touchEndCallback);
        }
    }

    /**
     * 清空所有回调函数引用
     */
    private clearAllCallback(): void {
        this._mouseEnterCallback = null;
        this._mouseLeaveCallback = null;
        this._touchStartCallback = null;
        this._touchEndCallback = null;
        this._touchCancelCallback = null;
    }
}