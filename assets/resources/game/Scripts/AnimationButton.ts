const { ccclass, property } = cc._decorator;

/**
 * 动画按钮组件
 * 功能：为按钮绑定不同交互状态的动画，适配移动端/PC端交互事件，同步按钮可交互状态
 * 支持状态：normal（正常）、pressed（按下）、hover（悬浮）、disabled（禁用）
 */
@ccclass('AnimationButton')
export default class AnimationButton extends cc.Component {
    /** 按钮动画组件 */
    @property({
        type: cc.Animation,
        displayName: '按钮动画组件',
        tooltip: '挂载在按钮节点上的Animation组件'
    })
    public btnAni: cc.Animation | null = null;

    /** 按钮组件 */
    @property({
        type: cc.Button,
        displayName: '按钮组件',
        tooltip: '当前节点的Button组件'
    })
    public btnComp: cc.Button | null = null;

    /** 正常状态动画片段 */
    @property({
        type: cc.AnimationClip,
        displayName: '正常状态动画',
        tooltip: '按钮正常状态播放的动画片段'
    })
    public normalClip: cc.AnimationClip | null = null;

    /** 按下状态动画片段 */
    @property({
        type: cc.AnimationClip,
        displayName: '按下状态动画',
        tooltip: '按钮按下时播放的动画片段'
    })
    public pressedClip: cc.AnimationClip | null = null;

    /** 悬浮状态动画片段 */
    @property({
        type: cc.AnimationClip,
        displayName: '悬浮状态动画',
        tooltip: '鼠标/手指悬浮时播放的动画片段（仅PC端生效）'
    })
    public hoverClip: cc.AnimationClip | null = null;

    /** 禁用状态动画片段 */
    @property({
        type: cc.AnimationClip,
        displayName: '禁用状态动画',
        tooltip: '按钮禁用时播放的动画片段'
    })
    public disableClip: cc.AnimationClip | null = null;

    // ===================== 私有状态变量 =====================
    /** 按钮是否可交互（同步btnComp.interactable） */
    private interactable: boolean = true;
    /** 是否停止所有动画播放 */
    public isStopAnimation: boolean = false;

    // ===================== 生命周期方法 =====================
    /**
     * 组件加载时初始化
     * 绑定交互事件，初始化按钮状态
     */
    protected onLoad(): void {
        // 空值保护：确保按钮组件存在
        if (!this.btnComp) {
            console.warn('[AnimationButton] 按钮组件未配置！节点：', this.node.name);
            return;
        }

        // 初始化按钮状态
        if (!this.btnComp.interactable) {
            this.interactable = false;
            this.setDisabled();
        } else {
            this.setNormal();
        }

        // 绑定交互事件：区分移动端/PC端
        this.bindInteractionEvents();
    }

    /**
     * 每帧更新后检查按钮状态（保证和Button组件状态同步）
     */
    protected lateUpdate(): void {
        if (!this.btnComp) return;

        // 检测按钮可交互状态变化
        if (this.interactable !== this.btnComp.interactable) {
            this.interactable = this.btnComp.interactable;
            // 状态同步：禁用/正常
            this.interactable ? this.setNormal() : this.setDisabled();
        }
    }

    // ===================== 事件绑定 =====================
    /**
     * 绑定交互事件（区分移动端/PC端）
     */
    private bindInteractionEvents(): void {
        if (!this.btnComp || !this.btnComp.node) return;

        const node = this.btnComp.node;
        // // 移动端：触摸事件
        // if (cc.sys.isMobile) {
        //     node.on(cc.Event.TOUCH, this.onTouchEnd, this);
        //     node.on(cc.Node.EventTouch.CANCEL, this.onTouchCancel, this);
        //     node.on(cc.Node.EventTouch.START, this.onTouchStart, this);
        // } 
        // // PC端：鼠标事件
        // else {
        //     node.on(Node.EventMouse.ENTER, this.onMouseEnter, this);
        //     node.on(Node.EventMouse.LEAVE, this.onMouseLeave, this);
        //     node.on(Node.EventMouse.DOWN, this.onMouseDown, this);
        //     node.on(Node.EventMouse.UP, this.onMouseUp, this);
        // }
    }

    // ===================== 事件回调 =====================
    /** 移动端-触摸结束 */
    private onTouchEnd(event: cc.Event.EventTouch): void {
        this.setNormal();
    }

    /** 移动端-触摸取消 */
    private onTouchCancel(event: cc.Event.EventTouch): void {
        this.setNormal();
    }

    /** 移动端-触摸开始 */
    private onTouchStart(event: cc.Event.EventTouch): void {
        this.setPressed();
    }

    /** PC端-鼠标进入 */
    private onMouseEnter(event: cc.Event.EventMouse): void {
        this.setHover();
    }

    /** PC端-鼠标离开 */
    private onMouseLeave(event: cc.Event.EventMouse): void {
        this.setNormal();
    }

    /** PC端-鼠标按下 */
    private onMouseDown(event: cc.Event.EventMouse): void {
        this.setPressed();
    }

    /** PC端-鼠标抬起 */
    private onMouseUp(event: cc.Event.EventMouse): void {
        this.setHover();
    }

    // ===================== 状态控制方法 =====================
    /**
     * 设置按钮为正常状态
     */
    public setNormal(): void {
        // 不可交互/动画停止时不执行
        if (!this.interactable || this.isStopAnimation) return;
        
        this.playAnimation(this.normalClip);
    }

    /**
     * 设置按钮为按下状态
     */
    public setPressed(): void {
        // 不可交互/动画停止时不执行
        if (!this.interactable || this.isStopAnimation) return;
        
        this.playAnimation(this.pressedClip);
    }

    /**
     * 设置按钮为悬浮状态（仅PC端生效）
     */
    public setHover(): void {
        // 不可交互/动画停止时不执行
        if (!this.interactable || this.isStopAnimation) return;
        
        this.playAnimation(this.hoverClip);
    }

    /**
     * 设置按钮为禁用状态
     */
    public setDisabled(): void {
        // 动画停止时不执行
        if (this.isStopAnimation) return;
        
        this.playAnimation(this.disableClip);
    }

    /**
     * 控制是否停止所有动画
     * @param isStop 是否停止动画
     */
    public setStopAnimation(isStop: boolean): void {
        if (!this.btnAni) return;

        this.isStopAnimation = isStop;
        if (isStop) {
            // 停止动画并重置时间
            this.btnAni.setCurrentTime(0);
            this.btnAni.stop();
        } else {
            // 恢复动画：根据当前可交互状态播放对应动画
            this.interactable ? this.setNormal() : this.setDisabled();
        }
    }

    // ===================== 工具方法 =====================
    /**
     * 播放指定动画片段（带空值保护和重复播放判断）
     * @param clip 要播放的动画片段
     */
    private playAnimation(clip: cc.AnimationClip): void {
        if (!this.btnAni) return;

        // 无动画片段时停止动画
        if (!clip) {
            this.btnAni.stop();
            return;
        }

        // 避免重复播放同一动画
        const clipName = clip.name;
        if (this.btnAni.currentClip && this.btnAni.currentClip.name === clipName) {
            return;
        }

        // 播放指定动画
        this.btnAni.play(clipName);
    }

    /**
     * 组件销毁时移除事件监听（防止内存泄漏）
     */
    protected onDestroy(): void {
        if (!this.btnComp || !this.btnComp.node) return;

        const node = this.btnComp.node;
        // // 移除所有绑定的事件
        // node.off(cc.Event.EventTouch, this.onTouchEnd, this);
        // node.off(Node.EventTouch.CANCEL, this.onTouchCancel, this);
        // node.off(Node.EventTouch.START, this.onTouchStart, this);
        // node.off(Node.EventMouse.ENTER, this.onMouseEnter, this);
        // node.off(Node.EventMouse.LEAVE, this.onMouseLeave, this);
        // node.off(Node.EventMouse.DOWN, this.onMouseDown, this);
        // node.off(Node.EventMouse.UP, this.onMouseUp, this);
    }
}