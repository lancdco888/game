const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import TSUtility from "../global_utility/TSUtility";
import ServiceInfoManager from "../ServiceInfoManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import RewardCenterMainButton from "../Main/RewardCenterMainButton";
import RewardCenterMainButton_Bingo from "../Main/RewardCenterMainButton_Bingo";
import RewardCenterMainButton_DailyBlitz from "../Main/RewardCenterMainButton_DailyBlitz";
import RewardCenterMainButton_FacebookConnect from "../Main/RewardCenterMainButton_FacebookConnect";
import RewardCenterMainButton_FanPage from "../Main/RewardCenterMainButton_FanPage";
import RewardCenterMainButton_Freebies from "../Main/RewardCenterMainButton_Freebies";
import RewardCenterMainButton_JiggyPrize from "../Main/RewardCenterMainButton_JiggyPrize";
import RewardCenterMainButton_LevelPass from "../Main/RewardCenterMainButton_LevelPass";
import RewardCenterMainButton_MembersBonus from "../Main/RewardCenterMainButton_MembersBonus";
import RewardCenterMainButton_ReelQuest from "../Main/RewardCenterMainButton_ReelQuest";
import RewardCenterView, { RewardCenterViewType } from "./RewardCenterView";

// ===================== 奖励中心主视图 继承奖励中心基类 =====================
@ccclass
export default class RewardCenterView_Main extends RewardCenterView {
    // ===================== 序列化绑定节点属性 原数据完整保留 类型精准匹配 =====================
    @property(cc.Node)
    private nodeContentRoot: cc.Node = null;

    // ===================== 私有成员变量 补全泛型注解 原初始化值保留 =====================
    private _arrButton: RewardCenterMainButton[] = [];

    // ===================== 重写父类方法 - 获取当前视图类型 核心标识 =====================
    public getType(): RewardCenterViewType {
        return RewardCenterViewType.MAIN;
    }

    // ===================== 静态公有核心方法 - 计算奖励中心红点总数 跨天重置+遍历所有福利按钮可领取状态 =====================
    public static getReceiveCount(): number {
        const redDotTime = ServerStorageManager.getAsNumber(StorageKeyType.REWARD_CENTER_RED_DOT);
        // 跨天判断：超过1天则重置红点计数为0
        if (!ServiceInfoManager.instance.isOverDay(redDotTime, 1)) {
            return 0;
        }

        let receiveCount = 0;
        // 遍历所有福利按钮 统计可领取的数量 → 红点总数
        if (RewardCenterMainButton_Bingo.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_DailyBlitz.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_FacebookConnect.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_FanPage.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_Freebies.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_JiggyPrize.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_LevelPass.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_MembersBonus.isCanReceive()) receiveCount++;
        if (RewardCenterMainButton_ReelQuest.isCanReceive()) receiveCount++;
        
        return receiveCount;
    }

    // ===================== 重写父类异步方法 - 初始化视图 加载所有福利按钮+绑定全局消息监听 =====================
    public async _initialize(): Promise<void> {
        // 获取容器下所有福利按钮组件
        this._arrButton = this.nodeContentRoot.getComponentsInChildren(RewardCenterMainButton);
        let index = 0;

        // 遍历所有按钮类型 初始化对应按钮并分配索引
        const initButton = (type: any) => {
            const targetBtn = this._arrButton.find(btn => btn.getType() === type);
            if (!TSUtility.isValid(targetBtn)) return;
            targetBtn.initialize(++index);
        };

        // 遍历所有RewardCenterMainButtonType枚举项 执行初始化
        for (const type in RewardCenterMainButton) {
            initButton(Number(type));
        }

        // 绑定全局消息监听：奖励中心视图更新 → 刷新UI
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_VIEW, this.updateUI, this);
    }

    // ===================== 重写父类异步方法 - 视图启动 执行UI刷新 =====================
    public async _onStart(): Promise<boolean> {
        this.updateUI();
        return true;
    }

    // ===================== 公有核心方法 - 刷新UI 核心按钮排序规则+按钮状态更新 =====================
    public updateUI(): void {
        // 遍历所有福利按钮 更新按钮自身状态 + 核心排序规则
        for (let i = 0; i < this._arrButton.length; i++) {
            const targetBtn = this._arrButton[i];
            if (TSUtility.isValid(targetBtn)) {
                targetBtn.updateUI();
                // ✅ 核心排序规则完整保留：可领取的按钮排前面(×1)，不可领取的排后面(×100)
                targetBtn.setNodeIndex(targetBtn.getIndex() * (targetBtn.isCanReceive() ? 1 : 100));
            }
        }
        // 保存当前服务器时间 用于后续跨天红点判断
        ServerStorageManager.saveCurrentServerTime(StorageKeyType.REWARD_CENTER_RED_DOT);
    }
}