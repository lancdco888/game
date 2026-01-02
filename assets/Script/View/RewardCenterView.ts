const { ccclass, property } = cc._decorator;

// 导入项目依赖模块 - 路径与原JS完全一致，直接复用
import TSUtility from "../global_utility/TSUtility";
import GameCommonSound from "../GameCommonSound";
import MessageRoutingManager from "../message/MessageRoutingManager";

/**
 * 奖励中心视图类型枚举 (原JS所有字段1:1完整保留，字段名/值无任何修改)
 * 所有奖励中心子视图的类型标识，用于视图切换判断
 */
export enum RewardCenterViewType {
    NONE = "None",
    MAIN = "Main",
    INBOX_INBOX = "Inbox",
    INBOX_SEND_GIFT = "Inbox_SendGift",
    INBOX_SEND_GIFT_HRV = "Inbox_SendGift_HRV",
    INBOX_SEND_GIFT_HRV_EMPTY_FRIEND = "Inbox_SendGift_HRV_EmptyFriend",
    INBOX_SEND_GIFT_HRV_GUEST_FIRST = "Inbox_SendGift_HRV_Guest_first",
    INBOX_SEND_GIFT_HRV_GUEST = "Inbox_SendGift_HRV_Guest",
    INBOX_SEND_GIFT_HRV_PERMISSION = "Inbox_SendGift_HRV_Permission",
    INBOX_SEND_GIFT_ELS = "Inbox_SendGift_ELS",
    INBOX_SEND_GIFT_ELS_EMPTY_FRIEND = "Inbox_SendGift_ELS_EmptyFriend",
    INBOX_SHARE = "Inbox_Share",
    TIME_BONUS = "TimeBonus",
    CHECK_IN_BONUS = "CheckInBonus"
}

@ccclass
export default class RewardCenterView extends cc.Component {
    // ====================== 私有成员变量 ======================
    /** 初始化状态标记 - 懒加载，确保初始化逻辑只执行一次 */
    private _isInitialized: boolean = false;

    // ====================== 核心生命周期方法 - 视图激活 (对外公开 异步方法) ======================
    /**
     * 视图激活核心方法 - 带懒加载初始化逻辑
     * 子类可按需重写内部保护方法，无需重写此方法
     */
    public async onEnableView(): Promise<void> {
        // 懒加载初始化：只执行一次
        if (!this._isInitialized) {
            await this._initialize();
            this._isInitialized = true;
        }
        
        // 执行视图启动逻辑，返回false则不激活视图节点
        const isStartSuccess = await this._onStart();
        if (!isStartSuccess) {
            return;
        }

        // 激活视图节点 + 执行视图激活逻辑
        this.node.active = true;
        await this._onEnable();

        // 发送全局消息：奖励中心视图已更新
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_VIEW);
    }

    // ====================== 核心生命周期方法 - 视图失活 (对外公开 异步方法) ======================
    /**
     * 视图失活核心方法
     * 子类可按需重写内部保护方法，无需重写此方法
     */
    public async onDisableView(): Promise<void> {
        await this._onDisable();
        this.node.active = false;
    }

    // ====================== 对外公开基础方法 (子类可重写) ======================
    /**
     * 获取当前视图类型，基类默认返回NONE，子类必须重写此方法返回对应枚举值
     */
    public getType(): RewardCenterViewType {
        return RewardCenterViewType.NONE;
    }

    /**
     * 是否支持返回上一级视图，基类默认返回true
     */
    public isOnBackAvailable(): boolean {
        return true;
    }

    /**
     * 视图切换核心方法 - 发送全局消息通知切换视图
     * @param viewType 目标视图类型 RewardCenterViewType
     */
    public changeView(viewType: RewardCenterViewType): void {
        MessageRoutingManager.instance().emitMessage(
            MessageRoutingManager.MSG.REWARD_CENTER_CHANGE_VIEW,
            JSON.stringify(viewType)
        );
    }

    // ====================== 按钮点击事件回调 - 视图切换通用回调 (对外绑定) ======================
    /**
     * 视图切换按钮通用点击回调
     * @param _event 按钮点击事件(未使用)
     * @param targetViewType 目标视图类型 字符串
     */
    public onClick_ChangeView(_event: any, targetViewType: string): void {
        // 校验参数有效性 + 播放按钮点击音效
        if (TSUtility.isValid(targetViewType)) {
            GameCommonSound.playFxOnce("btn_etc");
            this.changeView(targetViewType as RewardCenterViewType);
        }
    }

    // ====================== 保护方法 - 生命周期钩子 (供子类继承重写，基类空实现) ======================
    /**
     * 视图初始化逻辑 - 只执行一次
     * 子类重写：放视图的一次性初始化逻辑(节点绑定/数据初始化等)
     */
    protected async _initialize(): Promise<void> { }

    /**
     * 视图启动逻辑 - 每次激活前执行
     * 子类重写：放视图的前置校验逻辑，返回false则终止视图激活
     */
    protected async _onStart(): Promise<boolean> {
        return true;
    }

    /**
     * 视图激活逻辑 - 节点显示后执行
     * 子类重写：放视图的刷新/数据加载/事件绑定逻辑
     */
    protected async _onEnable(): Promise<void> { }

    /**
     * 视图失活逻辑 - 节点隐藏前执行
     * 子类重写：放视图的事件解绑/定时器清除/数据回收逻辑
     */
    protected async _onDisable(): Promise<void> { }
}