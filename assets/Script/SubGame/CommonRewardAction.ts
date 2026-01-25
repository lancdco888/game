import CommonServer from '../Network/CommonServer';
import UserInfo from '../User/UserInfo';
import AsyncHelper from '../global_utility/AsyncHelper';
import TSUtility from '../global_utility/TSUtility';
import { Utility } from '../global_utility/Utility';
import PopupManager from '../manager/PopupManager';
import { CommonRewardActionType, CommonRewardSubTitleType, CommonRewardTitle, CommonRewardTitleType } from './CommonRewardEnum';
const { ccclass, property } = cc._decorator;


// ===================== 奖励动作管理组件 =====================
/**
 * 奖励动作管理组件
 * 功能：管理奖励相关动画流程（UI显示、节点动画、按钮交互、音效、网络请求等）
 */
@ccclass()
export default class CommonRewardAction extends cc.Component {
    // ===================== 私有属性（UI节点缓存） =====================
    /** 标题UI节点 */
    private _nodeTitleUI: cc.Node | null = null;
    /** 标题根节点 */
    private _nodeTitleRoot: cc.Node | null = null;
    /** 副标题根节点 */
    private _nodeSubTitleRoot: cc.Node | null = null;
    /** 标题数组（存储不同类型的标题实例） */
    private _arrTitle: CommonRewardTitle[] = [];
    /** 副标题文本组件 */
    private _strSubTitle: cc.Label | null = null;
    /** 收集按钮组件 */
    private _btnCollect: cc.Button | null = null;
    /** 收集按钮回调函数 */
    private _callCollect: (() => void) | null = null;
    /** 奖励信息 */
    private _infoReward: any = null;
    /** 资源管理实例 */
    private _resource: {
        getNodePool(): { node: cc.Node };
        playOnceSound(soundName: string): void;
    } | null = null;
    /** 节点池实例 */
    private _nodePool: { node: cc.Node } | null = null;
    /** 动作配置信息 */
    private _info: {
        getTitleInfo(): {
            getTitle(): [CommonRewardTitleType, any];
            getSubTitle(): [CommonRewardSubTitleType, any];
        };
        getActionParam(): any;
        getFromInbox(): boolean;
    } | null = null;
    /** 根节点 */
    private _nodeRoot: cc.Node | null = null;
    /** 图片UI节点 */
    private _nodeImageUI: cc.Node | null = null;

    // ===================== 核心初始化方法 =====================
    /**
     * 初始化奖励动作组件
     * @param info 动作配置信息
     * @param resource 资源管理实例
     * @param infoReward 奖励信息
     */
    public initialize(info: any, resource: any, infoReward: any): void {
        this._info = info;
        this._resource = resource;
        this._infoReward = infoReward;
        
        // 初始化节点池
        if (this._resource) {
            this._nodePool = this._resource.getNodePool();
        }
        
        // 初始状态：隐藏节点
        this.node.active = false;
        
        // 获取根节点
        this._nodeRoot = this.node.getChildByName("Root");
        if (!TSUtility.isValid(this._nodeRoot)) return;

        // 初始化图片UI节点
        this._nodeImageUI = this._nodeRoot.getChildByName("ImageUI");
        
        // 初始化标题UI
        this._nodeTitleUI = this._nodeRoot.getChildByName("TitleUI");
        if (TSUtility.isValid(this._nodeTitleUI)) {
            // 初始化标题根节点
            this._nodeTitleRoot = this._nodeTitleUI.getChildByName("Title");
            if (TSUtility.isValid(this._nodeTitleRoot)) {
                // 收集所有标题节点并初始化
                this._arrTitle = [];
                this._nodeTitleRoot.children.forEach(node => {
                    this._arrTitle.push(new CommonRewardTitle(node));
                });
                // 初始隐藏所有标题
                this._arrTitle.forEach(title => {
                    const titleNode = title.getNode();
                    if (TSUtility.isValid(titleNode)) {
                        titleNode.active = false;
                    }
                });
            }

            // 初始化副标题根节点
            this._nodeSubTitleRoot = this._nodeTitleUI.getChildByName("SubTitle");
            if (TSUtility.isValid(this._nodeSubTitleRoot)) {
                // 遍历副标题子节点，只保留文本节点
                for (let i = 0; i < this._nodeSubTitleRoot.childrenCount; i++) {
                    const child = this._nodeSubTitleRoot.children[i];
                    if (!TSUtility.isValid(child)) continue;

                    if (child.name !== "Font_Reward_SubTitle") {
                        child.active = false;
                    } else {
                        this._strSubTitle = child.getComponent(cc.Label);
                        if (this._strSubTitle) {
                            this._strSubTitle.string = "";
                        }
                        child.active = true;
                    }
                }
            }
        }

        // 初始化收集按钮
        const btnNode = this._nodeRoot.getChildByName("ButtonUI");
        if (TSUtility.isValid(btnNode)) {
            this._btnCollect = btnNode.getComponent(cc.Button);
            if (this._btnCollect) {
                // 绑定收集按钮点击事件
                const eventHandler = Utility.getComponent_EventHandler(this.node, "CommonRewardAction", "onClickCollect", "");
                this._btnCollect.clickEvents.push(eventHandler);
                // 初始禁用按钮
                this._btnCollect.interactable = false;
            }
        }

        // 初始隐藏根节点
        this._nodeRoot.active = false;
    }

    // ===================== 核心动作流程 =====================
    /**
     * 获取奖励动作配置信息
     * @returns 动作配置信息
     */
    public getRewardActionInfo(): any {
        return this._info;
    }

    /**
     * 播放奖励动作主流程
     */
    public async playAction(): Promise<void> {
        // 1. 设置标题/副标题
        const titleInfo = this._info?.getTitleInfo();
        if (TSUtility.isValid(titleInfo)) {
            const [titleType, titleParam] = titleInfo.getTitle();
            this.setTitleUI(titleType, titleParam);
            
            const [subTitleType, subTitleParam] = titleInfo.getSubTitle();
            this.setSubTitleUI(subTitleType, subTitleParam);
        }

        // 2. 加载阶段
        await this._onLoad(this._info?.getActionParam());

        // 3. 显示节点并执行开始阶段
        this.node.active = true;
        await this._onStart();

        // 4. 播放按钮交互动画
        await this.playButtonUI();

        // 5. 执行处理阶段
        await this._onProcess();
    }

    /**
     * 结束奖励动作
     */
    public async endAction(): Promise<void> {
        await this._onEnd();
    }

    /**
     * 获取动作类型（默认NONE）
     * @returns 动作类型
     */
    public getType(): string | number {
        return CommonRewardActionType.NONE;
    }

    // ===================== 动作生命周期（可重写） =====================
    /**
     * 动作加载阶段（可重写）
     * @param param 动作参数
     */
    protected async _onLoad(param?: any): Promise<void> {
        // 空实现，供子类重写
    }

    /**
     * 动作开始阶段
     */
    protected async _onStart(): Promise<void> {
        // 显示根节点
        if (this._nodeRoot) {
            this._nodeRoot.active = true;
        }

        // 播放音效
        this._resource?.playOnceSound("get_pack");

        // 延迟0.5秒
        await AsyncHelper.delayWithComponent(0.5, this);
    }

    /**
     * 动作处理阶段（可重写）
     */
    protected async _onProcess(): Promise<void> {
        // 空实现，供子类重写
    }

    /**
     * 动作结束阶段
     */
    protected async _onEnd(): Promise<void> {
        // 清空所有定时器
        this.unscheduleAllCallbacks();
        
        // 隐藏节点
        this.node.active = false;
    }

    // ===================== UI控制方法 =====================
    /**
     * 播放音效
     * @param soundName 音效名称
     */
    public playOnceSound(soundName: string): void {
        this._resource?.playOnceSound(soundName);
    }

    /**
     * 判断是否来自收件箱
     * @returns true=来自收件箱，false=否
     */
    public isFromInbox(): boolean {
        return this._info?.getFromInbox() ?? false;
    }

    /**
     * 设置标题UI显示
     * @param type 标题类型
     * @param param 标题参数
     */
    public setTitleUI(type: CommonRewardTitleType, param: any = null): void {
        if (type === CommonRewardTitleType.NONE) return;

        // 遍历标题数组，显示匹配类型的标题
        for (const title of this._arrTitle) {
            const titleNode = title.getNode();
            if (!TSUtility.isValid(titleNode)) continue;

            if (title.getType() === type.toString()) {
                title.setParam(param);
                titleNode.active = true;
                break;
            } else {
                titleNode.active = false;
            }
        }
    }

    /**
     * 设置副标题UI显示
     * @param type 副标题类型
     * @param param 副标题参数
     */
    public setSubTitleUI(type: CommonRewardSubTitleType, param: any = null): void {
        if (!TSUtility.isValid(this._nodeSubTitleRoot) || type === CommonRewardSubTitleType.NONE) return;
        
        if (this._strSubTitle) {
            // 格式化副标题文本（支持参数替换）
            if (TSUtility.isValid(param)) {
                this._strSubTitle.string = type.toString().format(param.toString());
            } else {
                this._strSubTitle.string = type.toString();
            }
        }
    }

    /**
     * 判断收集按钮是否有效
     * @returns true=有效，false=无效
     */
    public isActiveButton(): boolean {
        return TSUtility.isValid(this._btnCollect);
    }

    /**
     * 播放收集按钮交互动画（启用按钮并等待点击）
     * @returns Promise（点击按钮后resolve）
     */
    public async playButtonUI(): Promise<void> {
        if (!TSUtility.isValid(this._btnCollect)) return;

        return new Promise((resolve) => {
            this._callCollect = resolve;
            this._btnCollect!.interactable = true;
        });
    }

    /**
     * 收集按钮点击回调
     */
    public onClickCollect(): void {
        if (!TSUtility.isValid(this._callCollect) || !this._btnCollect) return;

        // 禁用按钮并执行回调
        this._btnCollect.interactable = false;
        this._callCollect();
        this._callCollect = null; // 清空回调，避免重复执行
    }

    /**
     * 隐藏标题UI
     */
    public hideTitleUI(): void {
        if (TSUtility.isValid(this._nodeTitleUI)) {
            this._nodeTitleUI.active = false;
        }
    }

    // ===================== 节点操作方法 =====================
    /**
     * 获取节点池实例
     * @returns 节点池实例
     */
    public getNodePool(): { node: cc.Node } | null {
        return this._nodePool;
    }

    /**
     * 克隆节点（带父节点移动、按钮清空、渐显动画）
     * @param sourceNode 源节点
     * @param newParent 新父节点（默认节点池节点）
     * @param delayTime 渐显延迟时间（默认0）
     * @returns 克隆后的节点
     */
    public createCloneNode(sourceNode: cc.Node, newParent: cc.Node = this._nodePool?.node!, delayTime: number = 0): cc.Node {
        if (!TSUtility.isValid(sourceNode)) return new cc.Node();

        // 实例化克隆节点
        const cloneNode = cc.instantiate(sourceNode);
        
        // 移动到新父节点
        TSUtility.moveToNewParent(cloneNode, newParent);
        
        // 保持原世界坐标
        const worldPos = sourceNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = newParent.convertToNodeSpaceAR(worldPos);
        cloneNode.setPosition(localPos);

        // 清空克隆节点的所有按钮点击事件
        const buttons = cloneNode.getComponentsInChildren(cc.Button);
        if (TSUtility.isValid(buttons) && buttons.length > 0) {
            buttons.forEach(btn => {
                btn.clickEvents = [];
            });
        }

        // 渐显动画（延迟执行）
        if (delayTime > 0) {
            cloneNode.opacity = 0;
            this.scheduleOnce(() => {
                cloneNode.runAction(cc.fadeTo(0.3, 255));
            }, delayTime);
        }

        return cloneNode;
    }

    /**
     * 节点移动到收件箱动画
     * @param targetNode 目标节点
     * @returns Promise（动画完成后resolve）
     */
    public async moveNodeInbox(targetNode: cc.Node): Promise<void> {
        // 延迟0.5秒播放音效
        this.scheduleOnce(() => {
            this.playOnceSound("item");
        }, 0.5);

        return new Promise((resolve) => {
            // InboxAddNotiPopup.playEffectToTarget(targetNode, resolve);
        });
    }

    /**
     * 节点移动动画（带缩放、渐隐、音效）
     * @param sourceNode 源节点
     * @param targetNode 目标节点
     * @param duration 动画时长（默认0.75秒）
     * @param isActiveTarget 目标节点是否激活（默认true）
     * @param callback 动画完成回调
     * @returns Promise（动画完成后resolve）
     */
    public async moveNode(
        sourceNode: cc.Node,
        targetNode: cc.Node,
        duration: number = 0.75,
        isActiveTarget: boolean = true,
        callback: (() => void) | null = null
    ): Promise<void> {
        // 空值保护
        if (!TSUtility.isValid(sourceNode) || !TSUtility.isValid(targetNode)) return;

        // 激活目标节点
        targetNode.active = isActiveTarget;

        // 延迟0.2秒
        await AsyncHelper.delayWithComponent(0.2, this);

        // 延迟0.5秒播放音效
        this.scheduleOnce(() => {
            this.playOnceSound("item");
        }, 0.5);

        return new Promise((resolve) => {
            // 计算目标位置（转换为节点池本地坐标）
            const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            const targetPos = this._nodePool?.node.convertToNodeSpaceAR(worldPos) ?? cc.Vec2.ZERO;

            // 创建移动+缩放动画（easeIn缓动）
            const moveAction = cc.moveTo(duration, targetPos).easing(cc.easeIn(2));
            const scaleAction = cc.scaleTo(duration, 0).easing(cc.easeIn(2));
            const spawnAction = cc.spawn(moveAction, scaleAction);

            // 动画完成回调
            const callFunc = cc.callFunc(() => {
                callback?.(); // 执行自定义回调
                resolve();    // 解析Promise
            });

            // 执行节点动画
            sourceNode.runAction(cc.sequence(spawnAction, callFunc));

            // 根节点子节点渐隐（排除图片UI）
            if (TSUtility.isValid(this._nodeRoot)) {
                const children = this._nodeRoot.children;
                if (TSUtility.isValid(children) && children.length > 0) {
                    children.forEach(child => {
                        if (child.name !== this._nodeImageUI?.name) {
                            child.runAction(cc.fadeTo(duration / 2, 0));
                        }
                    });
                }
            }
        });

        // 延迟0.5秒
        await AsyncHelper.delayWithComponent(0.5, this);
    }

    /**
     * 无等待节点移动动画（立即执行）
     * @param sourceNode 源节点
     * @param targetNode 目标节点
     * @param duration 动画时长（默认0.75秒）
     * @param targetScale 目标缩放值（默认0）
     * @returns Promise（动画完成后resolve）
     */
    public async moveNodeNoWait(
        sourceNode: cc.Node,
        targetNode: cc.Node,
        duration: number = 0.75,
        targetScale: number = 0
    ): Promise<void> {
        // 空值保护
        if (!TSUtility.isValid(sourceNode) || !TSUtility.isValid(targetNode)) return;

        // 激活目标节点
        targetNode.active = true;

        // 延迟0.2秒
        await AsyncHelper.delayWithComponent(0.2, this);

        // 立即播放音效
        this.scheduleOnce(() => {
            this.playOnceSound("item");
        }, 0);

        return new Promise((resolve) => {
            // 计算目标位置（转换为节点池本地坐标）
            const worldPos = targetNode.convertToWorldSpaceAR(cc.v2());
            const targetPos = this._nodePool?.node.convertToNodeSpaceAR(worldPos) ?? cc.Vec2.ZERO;

            // 创建移动+缩放动画（easeSineOut缓动）
            const moveAction = cc.moveTo(duration, targetPos).easing(cc.easeSineOut());
            const scaleAction = cc.scaleTo(duration, targetScale).easing(cc.easeSineOut());
            const spawnAction = cc.spawn(moveAction, scaleAction);

            // 动画完成回调
            const callFunc = cc.callFunc(() => {
                resolve();
            });

            // 执行节点动画
            sourceNode.runAction(cc.sequence(spawnAction, callFunc));

            // 根节点子节点渐隐（排除图片UI）
            if (TSUtility.isValid(this._nodeRoot)) {
                const children = this._nodeRoot.children;
                if (TSUtility.isValid(children) && children.length > 0) {
                    children.forEach(child => {
                        if (child.name !== this._nodeImageUI?.name) {
                            child.runAction(cc.fadeTo(duration / 2, 0));
                        }
                    });
                }
            }
        });
    }

    // ===================== 网络请求方法 =====================
    /**
     * 请求收件箱信息（带加载进度）
     * @returns Promise（请求完成后resolve）
     */
    public async requestInboxInfo(): Promise<void> {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        return new Promise((resolve) => {
            const userInstance = UserInfo.instance();
            const uid = userInstance.getUid();
            const token = userInstance.getAccessToken();

            // 发送收件箱信息请求
            CommonServer.Instance().requestInboxInfo(uid, token, (response) => {
                // 隐藏加载进度
                PopupManager.Instance().showDisplayProgress(false);

                // 处理响应（无错误时更新收件箱信息）
                if (!CommonServer.isServerResponseError(response)) {
                    // const inboxInfo = new UserInboxInfo();
                    // inboxInfo.initUserInboxInfo(response.inbox);
                }

                resolve();
            });
        });
    }

    // ===================== 屏幕适配方法 =====================
    /**
     * 设置屏幕分辨率适配（缩放节点）
     * @param nodes 需要适配的节点数组
     */
    public async setScreenResolution(nodes: cc.Node[]): Promise<void> {
        // 获取Canvas组件（用于适配计算）
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (!TSUtility.isValid(canvas) || !canvas.node) return;

        // 计算缩放比例（基于1280x720基准分辨率）
        const canvasSize = canvas.node.getContentSize();
        const scaleX = canvasSize.width / 1280;
        const scaleY = canvasSize.height / 720;
        const finalScale = scaleX >= scaleY ? scaleX : scaleY;

        // 仅当缩放比例大于1时执行缩放
        if (finalScale > 1) {
            nodes.forEach(node => {
                if (TSUtility.isValid(node)) {
                    node.setScale(finalScale);
                }
            });
        }
    }

    // ===================== 组件销毁时清理 =====================
    protected onDestroy(): void {
        // 清空回调函数，避免内存泄漏
        this._callCollect = null;
        
        // 清空定时器
        this.unscheduleAllCallbacks();
    }
}

// ===================== 扩展String原型（支持format方法） =====================
declare global {
    interface String {
        format(...args: string[]): string;
    }
}

// 实现字符串格式化方法（适配原代码中的format调用）
if (!String.prototype.format) {
    String.prototype.format = function(...args: string[]): string {
        let str = this.toString();
        for (let i = 0; i < args.length; i++) {
            const reg = new RegExp(`\\{${i}\\}`, 'gm');
            str = str.replace(reg, args[i]);
        }
        return str;
    };
}