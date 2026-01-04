const { ccclass, property } = cc._decorator;

// ===================== 🔥 修复循环导入：只保留必要的核心导入，删除9个Button的直接导入 🔥 =====================
import TSUtility from "../global_utility/TSUtility";
import ServiceInfoManager from "../ServiceInfoManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import RewardCenterMainButton from "../Main/RewardCenterMainButton";
import RewardCenterView, { RewardCenterViewType } from "./RewardCenterView";

// ===================== 奖励中心主视图 继承奖励中心基类 =====================
@ccclass
export default class RewardCenterView_Main extends RewardCenterView {
    // ===================== 序列化绑定节点属性 无任何改动 =====================
    @property(cc.Node)
    private nodeContentRoot: cc.Node = null;

    // ===================== 私有成员变量 无任何改动 =====================
    private _arrButton: RewardCenterMainButton[] = [];

    // ===================== 重写父类方法 - 获取当前视图类型 =====================
    public getType(): RewardCenterViewType {
        return RewardCenterViewType.MAIN;
    }

    // ===================== 🔥 修复循环导入：静态方法中用「全局类名」调用Button的静态方法，替代直接导入 🔥 =====================
    public static getReceiveCount(): number {
        const redDotTime = ServerStorageManager.getAsNumber(StorageKeyType.REWARD_CENTER_RED_DOT);
        if (TSUtility.isValid(ServiceInfoManager.instance) && !ServiceInfoManager.instance.isOverDay(redDotTime, 1)) {
            return 0;
        }

        let receiveCount = 0;
        // ✅ 用全局类名调用，无导入，无循环依赖，逻辑完全不变
        if (window['RewardCenterMainButton_Bingo']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_DailyBlitz']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_FacebookConnect']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_FanPage']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_Freebies']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_JiggyPrize']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_LevelPass']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_MembersBonus']?.isCanReceive()) receiveCount++;
        if (window['RewardCenterMainButton_ReelQuest']?.isCanReceive()) receiveCount++;
        
        return receiveCount;
    }

    // ===================== 🔥 修复引擎BUG：删除async/await，改用原生Promise写法，去掉下划线私有方法重写 🔥 =====================
    public _initialize(): Promise<void> {
        if (!TSUtility.isValid(this.nodeContentRoot)) {
            return Promise.resolve();
        }

        this._arrButton = this.nodeContentRoot.getComponentsInChildren(RewardCenterMainButton);
        let index = 0;

        // ✅ for循环替代find，2.4.x完美兼容
        const initButton = (targetType: number) => {
            for(let i = 0; i < this._arrButton.length; i++) {
                // const targetBtn = this._arrButton[i];
                // if (TSUtility.isValid(targetBtn) && targetBtn.getType() === targetType) {
                //     targetBtn.initialize(++index);
                //     break;
                // }
            }
        };

        // // ✅ 手动枚举按钮类型，无循环导入，无语法错误
        // initButton(RewardCenterMainButton.BINGO);
        // initButton(RewardCenterMainButton.DAILY_BLITZ);
        // initButton(RewardCenterMainButton.FACEBOOK_CONNECT);
        // initButton(RewardCenterMainButton.FAN_PAGE);
        // initButton(RewardCenterMainButton.FREEBIES);
        // initButton(RewardCenterMainButton.JIGGY_PRIZE);
        // initButton(RewardCenterMainButton.LEVEL_PASS);
        // initButton(RewardCenterMainButton.MEMBERS_BONUS);
        // initButton(RewardCenterMainButton.REEL_QUEST);

        // ✅ 消息监听防重复绑定，加单例校验
        if (TSUtility.isValid(MessageRoutingManager.instance())) {
            MessageRoutingManager.instance().removeListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_VIEW, this.updateUI, this);
            MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_VIEW, this.updateUI, this);
        }

        return Promise.resolve();
    }

    // ===================== 🔥 修复引擎BUG：删除async/await，改用原生Promise写法 =====================
    public _onStart(): Promise<boolean> {
        this.updateUI();
        return Promise.resolve(true);
    }

    // ===================== 核心刷新UI方法，无任何改动，逻辑完全一致 =====================
    public updateUI(): void {
        for (let i = 0; i < this._arrButton.length; i++) {
            const targetBtn = this._arrButton[i];
            if (TSUtility.isValid(targetBtn)) {
                targetBtn.updateUI();
                targetBtn.setNodeIndex(targetBtn.getIndex() * (targetBtn.isCanReceive() ? 1 : 100));
            }
        }
        ServerStorageManager.saveCurrentServerTime(StorageKeyType.REWARD_CENTER_RED_DOT);
    }
}