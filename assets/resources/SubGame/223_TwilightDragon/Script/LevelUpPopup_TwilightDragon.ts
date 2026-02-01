import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotManager from "../../../../Script/manager/SlotManager";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙等级提升弹窗组件
 * 负责显示等级提升动画、奖励/倍率节点切换、旋转次数移动动画
 */
@ccclass("LevelUpPopup_TwilightDragon")
export default class LevelUpPopup_TwilightDragon extends cc.Component {
    // 弹窗核心节点与动画（对应原始JS，供编辑器序列化）
    @property(cc.Node)
    blockingBG: cc.Node = null!;

    @property(cc.Animation)
    rootAnimation: cc.Animation = null!;

    @property([cc.Node])
    bonusNodes: cc.Node[] = [];

    @property(cc.Node)
    movingSpinCnt: cc.Node = null!;

    @property(cc.Node)
    receiveSpinCountNode: cc.Node = null!;

    @property([cc.Node])
    multiplierNodes: cc.Node[] = [];

    // 私有回调函数（保存弹窗关闭后的回调逻辑）
    private _callback: (() => void) | null = null;

    /**
     * 组件加载时初始化（刷新背景尺寸适配）
     */
    onLoad(): void {
        this.refresh();
    }

    /**
     * 刷新弹窗（适配背景节点尺寸）
     */
    refresh(): void {
        TSUtility.setNodeViewSizeFit(this.blockingBG);
    }

    /**
     * 打开等级提升弹窗
     * @param level 当前提升后的等级
     * @param callback 弹窗关闭后的回调函数
     */
    open(level: number, callback: () => void): void {
        // 激活弹窗节点，初始化动画状态
        this.node.active = true;
        this.rootAnimation.node.opacity = 0;
        this.rootAnimation.play("Popup_Gauge_Upgrade", 0);
        this._callback = callback;

        // 1. 切换奖励节点（等级≥3显示第1个，否则显示第0个）
        const bonusNodeIndex = level >= 3 ? 1 : 0;
        this.bonusNodes.forEach((node, index) => {
            node.active = index === bonusNodeIndex;
        });

        // 2. 切换倍率节点（等级>1显示第1个，否则显示第0个）
        const multiplierNodeIndex = level > 1 ? 1 : 0;
        this.multiplierNodes.forEach((node, index) => {
            node.active = index === multiplierNodeIndex;
        });

        // 3. 初始化旋转次数节点状态与位置
        this.movingSpinCnt.active = false;
        this.receiveSpinCountNode.active = false;
        this.movingSpinCnt.setPosition(0, 230);

        // 4. 延迟播放旋转次数移动动画（对应原始逻辑2.4秒延迟）
        this.scheduleOnce(() => {
            this.movingSpinCnt.active = true;

            // 计算目标位置（转换为父节点本地坐标）
            const worldTargetPos = this.receiveSpinCountNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            const localTargetPos = this.movingSpinCnt.parent?.convertToNodeSpaceAR(worldTargetPos) || cc.Vec2.ZERO;

            // 调整接收节点层级，初始化状态
            this.receiveSpinCountNode.setSiblingIndex(1);
            this.receiveSpinCountNode.active = false;

            // 创建移动动作序列：移动→激活接收节点
            const moveAction = cc.sequence(
                cc.moveTo(0.33, localTargetPos.x, localTargetPos.y),
                cc.callFunc(() => {
                    this.receiveSpinCountNode.active = false; // 先隐藏再显示，触发视觉刷新
                    this.receiveSpinCountNode.active = true;
                })
            );

            // 执行移动动作，播放对应音效
            this.movingSpinCnt.runAction(moveAction);
            SlotSoundController.Instance().playAudio("LevelUpPopupHide", "FX");
        }, 2.4);

        // 5. 监听动画完成事件，触发关闭逻辑
        this.rootAnimation.once(cc.Animation.EventType.FINISHED, () => {
            this.onClose();
        });

        // 6. 延迟隐藏弹窗，执行回调并更新游戏免费旋转状态（对应原始逻辑2.77秒延迟）
        this.scheduleOnce(() => {
            this.node.active = false;
            if (this._callback) {
                this._callback();
            }
            SlotManager.Instance.setFreespinExtraInfoByCurrentState();
        }, 2.77);
    }

    /**
     * 弹窗关闭回调（预留扩展，原始逻辑无额外操作）
     */
    onClose(): void {}
}