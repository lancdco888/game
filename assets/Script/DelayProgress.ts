const { ccclass, property } = cc._decorator;

/**
 * 全局加载遮罩/阻塞层/进度动画管理器 (核心组件，被PopupManager依赖)
 * 核心功能：显示全局阻塞遮罩(禁止所有交互)、显示加载转圈动画、半透明暗层淡入淡出动画、尺寸适配屏幕变化
 * 所有阻塞式操作(弹窗加载/网络请求/资源加载)的遮罩层均由该组件统一管理，全局唯一实例
 */
@ccclass
export default class DelayProgress extends cc.Component {
    // ===================== 【序列化属性】与原代码完全一致 (编辑器拖拽赋值，可见可改，属性名无任何修改) =====================
    @property(cc.Node)
    public blockBG: cc.Node = null;        // 全屏阻塞遮罩节点 - 完全屏蔽下层所有交互事件

    @property(cc.Node)
    public dimmedBG: cc.Node = null;       // 半透明暗层节点 - 视觉暗化效果，带淡入淡出动画

    @property(Animation)
    public progressAni: cc.Animation = null; // 加载进度动画组件(转圈/进度条) - 播放加载动画

    @property(cc.Label)
    public infoLabel: cc.Label = null;     // 加载提示文本标签 - 原逻辑中暂未启用显示

    // ===================== 【生命周期回调】原逻辑完全保留 - 初始化默认隐藏所有节点 =====================
    /** 组件加载时初始化：所有节点默认隐藏，暗层透明度置0，无任何动画播放 */
    onLoad(): void {
        this.blockBG.active = false;
        this.progressAni.node.active = false;
        this.infoLabel.node.active = false;
        this.dimmedBG.active = false;
        this.dimmedBG.opacity = 0;
    }

    // ===================== 【对外暴露核心方法】与原代码完全一致，逻辑零改动，PopupManager直接调用 =====================
    /**
     * 适配屏幕尺寸：同步更新阻塞遮罩和暗层的尺寸为屏幕尺寸
     * @param size 屏幕/Canvas的尺寸对象
     */
    public setContentSize(size: cc.Size): void {
        this.blockBG.setContentSize(size);
        this.dimmedBG.setContentSize(size);
    }

    /**
     * 设置加载动画节点的缩放比例
     * @param scale 缩放值
     */
    public setScaleAniNode(scale: number): void {
        this.progressAni.node.setScale(scale);
    }

    /**
     * 显示/隐藏【纯阻塞遮罩】- 只屏蔽交互，无动画、无暗层、无文本
     * 最常用的阻塞方式，弹窗加载/网络请求时调用
     * @param isShow 是否显示阻塞遮罩
     */
    public showBlockingBG(isShow: boolean): void {
        this.blockBG.active = isShow;
        this.progressAni.node.active = false;
        this.infoLabel.node.active = false;
        this.dimmedBG.active = false;
        this.dimmedBG.stopAllActions();
    }

    /**
     * 判断当前是否处于【阻塞状态】- PopupManager核心判断方法
     * @returns boolean true=有阻塞遮罩，false=无阻塞遮罩
     */
    public isBlocking(): boolean {
        return this.blockBG.active;
    }

    /**
     * 显示/隐藏【带加载动画的阻塞层】- 屏蔽交互+显示转圈动画+半透明暗层(带淡入淡出动画)
     * 资源加载/耗时操作时调用，视觉体验更好
     * @param isShow 是否显示加载动画+阻塞遮罩
     * @param isPlayDimmedAni 是否播放暗层的淡入淡出动画 (默认true)
     */
    public showDisplayProgress(isShow: boolean, isPlayDimmedAni: boolean): void {
        this.blockBG.active = isShow;
        this.progressAni.node.active = isShow;
        this.infoLabel.node.active = false;

        if (isPlayDimmedAni) {
            this.dimmedBG.stopAllActions();
            if (isShow) {
                // 显示：暗层激活 + 0.5秒淡入到透明度100
                this.dimmedBG.active = true;
                this.dimmedBG.runAction(cc.fadeTo(0.5, 100));
            } else {
                // 隐藏：暗层激活 + 0.1秒淡出到透明度0
                this.dimmedBG.active = true;
                this.dimmedBG.runAction(cc.fadeTo(0.1, 0));
            }
        } else {
            // 不播放动画：直接隐藏暗层
            this.dimmedBG.active = false;
        }
    }
}