const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import TSUtility from "../global_utility/TSUtility";
import RewardCenterPopup from "./RewardCenterPopup";
import RewardCenterView, { RewardCenterViewType } from "../View/RewardCenterView";

@ccclass
export default class RewardCenterTab extends cc.Component {
    // ====================== 私有成员属性 (原JS原型属性，补全严格TS类型，初始值与原JS一致) ======================
    private _eType: RewardCenterViewType = RewardCenterViewType.NONE;
    private _btn: cc.Button | null = null;
    private _nodeEnable: cc.Node | null = null;
    private _nodeDisable: cc.Node | null = null;
    private _arrAnim: cc.Animation[] = [];
    private _arrRedDotNode: cc.Node[] = [];
    private _arrRedDotLabel: cc.Label[] = [];

    // ====================== 核心初始化方法 (原JS逻辑1:1精准还原，链式调用返回自身，标签页核心初始化入口) ======================
    public initialize(type: RewardCenterViewType): RewardCenterTab {
        this._eType = type;
        // 获取当前节点的按钮组件
        this._btn = this.node.getComponent(cc.Button);
        // 获取所有子节点中的动画组件
        this._arrAnim = this.node.getComponentsInChildren(cc.Animation);
        // 获取启用/禁用态的显示节点
        this._nodeEnable = this.node.getChildByName("Enable");
        this._nodeDisable = this.node.getChildByName("Disable");

        // 初始化默认状态为【禁用】
        this.setEnable(false);

        // ✅ 原JS细节保留：按钮组件兜底创建，如果节点无Button组件则自动添加
        if (!TSUtility.isValid(this._btn)) {
            this._btn = this.node.addComponent(cc.Button);
        }

        // ✅ 收集红点节点：启用态/禁用态节点下各一个RedDot，保证双节点红点同步
        this._arrRedDotNode.push(this._nodeEnable!.getChildByName("RedDot"));
        this._arrRedDotNode.push(this._nodeDisable!.getChildByName("RedDot"));

        // 初始化红点状态+收集红点数字标签组件
        this._arrRedDotNode.forEach(redDotNode => {
            redDotNode.active = false;
            const labelNode = redDotNode.getChildByName("Label_RedDot");
            if (TSUtility.isValid(labelNode)) {
                const label = labelNode.getComponent(cc.Label);
                TSUtility.isValid(label) && this._arrRedDotLabel.push(label);
            }
        });

        return this;
    }

    // ====================== 公共getter方法 (原JS逻辑完全还原，只读属性，获取标签类型/按钮组件) ======================
    public getType(): RewardCenterViewType {
        return this._eType;
    }

    public getButton(): cc.Button | null {
        return this._btn;
    }

    // ====================== 核心UI控制方法 (设置标签启用/禁用状态，核心动画播放逻辑精准保留) ======================
    public setEnable(isEnable: boolean): void {
        // 切换启用/禁用节点的显示状态
        TSUtility.isValid(this._nodeEnable) && (this._nodeEnable.active = isEnable);
        TSUtility.isValid(this._nodeDisable) && (this._nodeDisable.active = !isEnable);

        // ✅ 原JS细节保留：所有动画组件重置播放时间为0 → 立即重新播放，保证切换状态时动画必触发
        this._arrAnim.forEach(anim => {
            anim.setCurrentTime(0);
            anim.play();
        });
    }

    // ====================== 核心红点更新方法 (原JS核心业务逻辑，红点数字计算+封顶+双节点同步，一丝不差) ======================
    public updateRedDot(): void {
        // 获取当前标签类型对应的可领取奖励数量
        const receiveCount = RewardCenterPopup.getGroupReceiveCount(RewardCenterViewType[this.getType()]);
        // ✅ 核心规则保留：红点数字封顶99，超过99都显示99
        const showCount = receiveCount >= 99 ? 99 : receiveCount;

        // 同步所有红点节点的显示状态：有奖励则显示红点，无则隐藏
        this._arrRedDotNode.forEach(redDotNode => {
            redDotNode.active = showCount > 0;
        });

        // 给所有红点标签赋值数字，保证多节点红点数字一致
        this._arrRedDotLabel.forEach(label => {
            TSUtility.isValid(label) && (label.string = showCount.toString());
        });
    }
}