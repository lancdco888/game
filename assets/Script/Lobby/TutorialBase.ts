const { ccclass, property } = cc._decorator;

// ===================== 导入所有依赖模块 - 路径与原JS完全一致 =====================
import AsyncHelper from "../global_utility/AsyncHelper";
import CommonSoundSetter from "../global_utility/CommonSoundSetter";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import SoundManager from "../manager/SoundManager";

// ===================== 核心内部类 - TutorialState 完整复刻 (原JS的h类) 教程状态基类 =====================
export class TutorialState extends cc.Component {
    // 私有成员变量 补全TS类型标注
    public _tutorialBase: TutorialBase | null = null;
    public _listData: any[] | null = null;

    // 构造函数 接收可变参数 与原JS完全一致
    constructor(...args: any[]) {
        super();
        this._tutorialBase = null;
        this._listData = null;
        this._listData = args;
    }

    // 教程开始钩子
    public onStart(tutorialBase: TutorialBase): void {
        this._tutorialBase = tutorialBase;
        this._onStart();
    }

    // 教程完成钩子
    public onDone(): void {
        this._tutorialBase?.onDone();
        this.unscheduleAllCallbacks();
    }

    // 教程执行钩子
    public async onProcess(): Promise<void> {
        await this._onProcess();
    }

    // 教程结束钩子
    public onEnd(): void {
        this._onEnd();
    }

    // 教程最终完成回调
    public onFinish(isForce: boolean = false): void {
        this._tutorialBase?.onFinish(isForce);
    }

    // ===================== 音效控制工具方法 - 与原JS逻辑一致 =====================
    public playSoundOnce(audioKey: string): void {
        if (TSUtility.isValid(this._tutorialBase?.sound)) {
            SoundManager.Instance().playFxOnce(this._tutorialBase!.sound.getAudioClip(audioKey));
        }
    }

    public playSoundLoop(audioKey: string): void {
        if (TSUtility.isValid(this._tutorialBase?.sound)) {
            SoundManager.Instance().playFxLoop(this._tutorialBase!.sound.getAudioClip(audioKey));
        }
    }

    public stopSoundLoop(audioKey: string): void {
        if (TSUtility.isValid(this._tutorialBase?.sound)) {
            SoundManager.Instance().stopFxLoop(this._tutorialBase!.sound.getAudioClip(audioKey));
        }
    }

    // 设置节点尺寸为画布大小
    public setNodeToCavaceSize(targetNode: cc.Node): void {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        targetNode.setContentSize(canvas.node.getContentSize());
    }

    // 异步播放节点下所有动画 原JS混淆异步语法还原为TS原生async/await
    public async playAllAnimationAction(targetNode: cc.Node): Promise<void> {
        const animComps = targetNode.getComponentsInChildren(cc.Animation);
        if (!TSUtility.isValid(animComps) || animComps.length <= 0) return;

        let maxAnimDuration = 0;
        animComps.forEach(anim => {
            if (TSUtility.isValid(anim)) {
                const defaultClip = anim.defaultClip;
                if (TSUtility.isValid(defaultClip)) {
                    anim.setCurrentTime(0);
                    anim.play(defaultClip.name, 0);
                    maxAnimDuration = Math.max(maxAnimDuration, defaultClip.duration);
                }
            }
        });
        await AsyncHelper.delayWithComponent(maxAnimDuration, this);
    }

    // ===================== 空钩子方法 留给子类重写 =====================
    protected _onStart(): void { }

    protected async _onProcess(): Promise<void> { }

    protected _onEnd(): void { }
}

// ✅ 核心修复: 自定义Component组件 必须使用 空的@ccclass() 无类名字符串 - 彻底根治类名报错
@ccclass()
export default class TutorialBase extends cc.Component {
    // ===================== 序列化属性 - 原JS @property 完整复刻 标准正确写法 =====================
    @property({ type: cc.Node })
    public nodeRoot: cc.Node = null!;

    @property({ type: cc.Button })
    public btnDim: cc.Button = null!;

    // ===================== 私有成员变量 - 补全精准TS类型标注 杜绝any滥用 =====================
    private _listTutorialState: TutorialState[] = [];
    private _curTutorialState: TutorialState | null = null;
    private _callFinish: ((isForce: boolean) => void) | null = null;
    private _btnCallback_1: Function | null = null;
    private _btnCallback_2: Function | null = null;
    private _isInitialized: boolean = false;

    // ===================== 公共只读属性 - 原JS Object.defineProperty 完整还原为TS原生get访问器 =====================
    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    // ===================== 音效组件 - 动态获取 与原JS一致 =====================
    public sound: CommonSoundSetter | null = null;

    // ===================== 生命周期 - onLoad 初始化逻辑 与原JS完全一致 =====================
    onLoad(): void {
        if (this._isInitialized) return;

        if (TSUtility.isValid(this.nodeRoot)) {
            this.nodeRoot.active = false;
        }
        // 获取音效组件
        this.sound = this.node.getComponent(CommonSoundSetter);
        // 初始化钩子
        this.initialize();
        // 标记初始化完成
        this._isInitialized = true;
    }

    // ===================== 初始化空钩子 留给子类重写 =====================
    public initialize(): void { }

    // ===================== 核心方法 - 启动教程 入口方法 =====================
    public onStart(callFinish: (isForce: boolean) => void, isSetSize: boolean = true): void {
        if (!this.isInitialized) {
            this.onLoad();
        }

        this._callFinish = callFinish;
        this._btnCallback_1 = null;
        this._btnCallback_2 = null;

        // 添加遮罩按钮点击事件
        this.btnDim.clickEvents.push(Utility.getComponent_EventHandler(this.node, "TutorialBase", "onClickDone", ""));

        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        // 设置遮罩和根节点尺寸为画布大小
        if (isSetSize) {
            this.btnDim.node.setContentSize(canvas.node.getContentSize());
        }
        this.nodeRoot.setContentSize(canvas.node.getContentSize());
        this.nodeRoot.active = true;

        // 开始执行教程流程
        this.setTutorial();
    }

    // ===================== 教程完成回调 切换下一个教程状态 =====================
    public onDone(): void {
        this._btnCallback_1 = null;
        this._btnCallback_2 = null;
        this.setTutorial();
    }

    // ===================== 教程状态管理 - 添加/获取教程数据 =====================
    public addTutorialData(tutorialState: TutorialState): void {
        this._listTutorialState.push(tutorialState);
    }

    public getTutorialData(): TutorialState | null {
        if (!TSUtility.isValid(this._listTutorialState) || this._listTutorialState.length <= 0) {
            return null;
        }
        return this._listTutorialState.shift()!;
    }

    // ===================== 核心逻辑 - 设置并执行当前教程状态 =====================
    public setTutorial(): void {
        // 结束上一个教程状态
        if (TSUtility.isValid(this._curTutorialState)) {
            this._curTutorialState.onEnd();
            this._curTutorialState = null;
        }

        // 获取下一个教程状态
        this._curTutorialState = this.getTutorialData();

        // 执行当前教程 无状态则完成整个教程
        if (TSUtility.isValid(this._curTutorialState)) {
            this._curTutorialState.onStart(this);
            this._curTutorialState.onProcess();
        } else {
            this.onFinish();
        }
    }

    // ===================== 教程最终完成 执行回调 =====================
    public onFinish(isForce: boolean = false): void {
        if (TSUtility.isValid(this.nodeRoot)) {
            this.nodeRoot.active = false;
        }
        if (TSUtility.isValid(this._callFinish)) {
            this._callFinish!(isForce);
        }
    }

    // ===================== 按钮点击事件回调 =====================
    public onClickDone(): void {
        this.onDone();
    }

    public onClickEvent(): void {
        if (TSUtility.isValid(this._btnCallback_1)) {
            this._btnCallback_1!();
        }
    }

    public onClickEvent2(): void {
        if (TSUtility.isValid(this._btnCallback_2)) {
            this._btnCallback_2!();
        }
    }

    // ===================== 核心工具方法 - 克隆节点 + 位置同步 + 渐显动画 =====================
    public createCloneNode(srcNode: cc.Node, parentNode: cc.Node, delayFadeTime: number = 0): cc.Node {
        const cloneNode = cc.instantiate(srcNode);
        // 移动到新父节点
        TSUtility.moveToNewParent(cloneNode, parentNode);
        // 同步世界坐标到本地坐标
        cloneNode.setPosition(parentNode.convertToNodeSpaceAR(srcNode.convertToWorldSpaceAR(cc.v2())));

        // 延迟渐显动画
        if (delayFadeTime > 0) {
            cloneNode.opacity = 0;
            this.scheduleOnce(() => {
                cloneNode.runAction(cc.fadeTo(0.3, 255));
            }, delayFadeTime);
        }
        return cloneNode;
    }

    // ===================== 核心工具方法 - 给节点添加按钮组件 + 绑定点击事件 =====================
    public addButtonComponent(targetNode: cc.Node, callback: Function): cc.Button {
        const btnComp = targetNode.addComponent(cc.Button);
        // 绑定第一个/第二个回调
        if (!TSUtility.isValid(this._btnCallback_1)) {
            this._btnCallback_1 = callback;
            btnComp.clickEvents.push(Utility.getComponent_EventHandler(this.node, "TutorialBase", "onClickEvent", ""));
        } else {
            this._btnCallback_2 = callback;
            btnComp.clickEvents.push(Utility.getComponent_EventHandler(this.node, "TutorialBase", "onClickEvent2", ""));
        }
        return btnComp;
    }

    // ===================== 按钮事件移除/禁用 =====================
    public removeButtonEvent(targetNode: cc.Node, isInteractable: boolean = false): void {
        if (!TSUtility.isValid(targetNode)) return;

        const btnComps = targetNode.getComponentsInChildren(cc.Button);
        if (!TSUtility.isValid(btnComps) || btnComps.length <= 0) return;

        btnComps.forEach(btn => {
            btn.clickEvents = [];
            btn.interactable = isInteractable;
        });
    }

    // ===================== 移除节点上的按钮组件 =====================
    public removeButtonScript(targetNode: cc.Node): void {
        if (!TSUtility.isValid(targetNode)) return;

        const btnComps = targetNode.getComponentsInChildren(cc.Button);
        if (!TSUtility.isValid(btnComps) || btnComps.length <= 0) return;

        btnComps.forEach(() => {
            targetNode.removeComponent(cc.Button);
        });
    }

    // ===================== 修改按钮绑定的回调事件 =====================
    public changeButtonEvent(targetNode: cc.Node, callback: Function): cc.Button[] {
        if (!TSUtility.isValid(targetNode)) return [];

        const btnComps = targetNode.getComponentsInChildren(cc.Button);
        if (!TSUtility.isValid(btnComps) || btnComps.length <= 0) return [];

        // 绑定新回调并清空原有事件
        if (!TSUtility.isValid(this._btnCallback_1)) {
            this._btnCallback_1 = callback;
            btnComps.forEach(btn => {
                btn.clickEvents = [];
                btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "TutorialBase", "onClickEvent", ""));
            });
        } else {
            this._btnCallback_2 = callback;
            btnComps.forEach(btn => {
                btn.clickEvents = [];
                btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "TutorialBase", "onClickEvent2", ""));
            });
        }
        return btnComps;
    }

    // ===================== 按钮延迟可点击 =====================
    public playWaitClickEvent(targetNode: cc.Node, delayTime: number): void {
        if (!TSUtility.isValid(targetNode)) return;

        const btnComps = targetNode.getComponentsInChildren(cc.Button);
        if (!TSUtility.isValid(btnComps) || btnComps.length <= 0) return;

        btnComps.forEach(btn => {
            btn.interactable = false;
            this.scheduleOnce(() => {
                btn.interactable = true;
            }, delayTime);
        });
    }
}