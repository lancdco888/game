import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

// ===================== 龙珠游戏转盘左侧UI组件 =====================
/**
 * 龙珠游戏转盘左侧UI组件
 * 管理左侧UI的显隐、不同免费旋转模式的龙珠切换、转盘触发/闲置动画播放
 */
@ccclass()
export default class WheelLeftUI_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS完全一致） =====================
    /** 左侧UI根节点（控制整体显隐） */
    @property(cc.Node)
    public root: cc.Node | null = null;

    /** 龙珠节点列表（0:red 1:blue 2:green） */
    @property([cc.Node])
    public orbList: cc.Node[] = [];

    // ===================== 核心业务方法（与原JS逻辑1:1保留，补充空值保护） =====================
    /**
     * 隐藏左侧UI（仅隐藏根节点）
     */
    public hide(): void {
        if (TSUtility.isValid(this.root)) {
            this.root.active = false;
        }
    }

    /**
     * 显示左侧UI并切换对应免费旋转模式的龙珠
     * @param mode 模式标识（freeSpin_red/freeSpin_blue/freeSpin_green）
     */
    public show(mode: string): void {
        // 重置所有龙珠节点显隐状态
        this.orbList.forEach(node => {
            if (TSUtility.isValid(node)) node.active = false;
        });

        // 根据模式标识激活对应龙珠节点
        if (mode === "freeSpin_red") {
            if (TSUtility.isValid(this.orbList[0])) this.orbList[0].active = true;
        } else if (mode === "freeSpin_blue") {
            if (TSUtility.isValid(this.orbList[1])) this.orbList[1].active = true;
        } else if (mode === "freeSpin_green") {
            if (TSUtility.isValid(this.orbList[2])) this.orbList[2].active = true;
        }

        // 显示左侧UI根节点
        if (TSUtility.isValid(this.root)) {
            this.root.active = true;
        }
    }

    /**
     * 触发转盘动画（播放触发动画，完成后自动切换到闲置动画）
     */
    public trigger(): void {
        const self = this;
        const aniComp = this.getComponent(cc.Animation);
        if (!TSUtility.isValid(aniComp)) return;

        // 播放转盘触发动画
        aniComp.play("Left_UI_Wheel_Trigger_Ani");
        
        // 监听动画完成事件，切换到闲置动画
        aniComp.once("finished", () => {
            aniComp.play("Left_UI_Wheel_Idle_Ani");
        });
    }
}