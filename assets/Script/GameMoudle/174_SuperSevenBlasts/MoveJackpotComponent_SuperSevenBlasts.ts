import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import ApplyJakcpotComponent_SuperSevenBlasts from "./ApplyJakcpotComponent_SuperSevenBlasts";
import SuperSevenBlastsManager from "./SuperSevenBlastsManager";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts Jackpot符号移动组件（控制符号实例化、移动动画、特效音效）
 */
@ccclass()
export default class MoveJackpotComponent_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 符号移动的父节点（承载实例化的预制体） */
    @property(cc.Node)
    public moveNode: cc.Node = null;

    /** Jackpot符号预制体 */
    @property(cc.Prefab)
    public movePrefab: cc.Prefab = null;

    /** 激活特效节点 */
    @property(cc.Node)
    public alive_Fx: cc.Node = null;

    // ========== 固定尺寸参数（原JS硬编码值） ==========
    /** 符号宽度 */
    public width: number = 180;
    /** 符号高度 */
    public height: number = 118;

    /**
     * 移动Jackpot符号（实例化预制体+播放动画+调度回调）
     * @param col 列索引（e）
     * @param row 行索引（t）
     * @param jackpotType jackpot类型（n）
     */
    public moveJackpotSymbol(col: number, row: number, jackpotType: number): void {
        // 取消所有未执行的定时器
        this.unscheduleAllCallbacks();

        // 预制体未赋值时直接返回（避免崩溃）
        if (!TSUtility.isValid(this.movePrefab) || !TSUtility.isValid(this.moveNode)) {
            return;
        }

        // 实例化Jackpot符号预制体
        const jackpotNode = cc.instantiate(this.movePrefab);
        if (!TSUtility.isValid(jackpotNode)) {
            return;
        }

        // 将实例化节点添加到父节点
        this.moveNode.addChild(jackpotNode);

        // 获取Jackpot应用组件并调用显示方法（n-1：原业务逻辑）
        const applyJackpotComp = jackpotNode.getComponent(ApplyJakcpotComponent_SuperSevenBlasts);
        if (TSUtility.isValid(applyJackpotComp)) {
            applyJackpotComp.showJackpot(jackpotType - 1);
        }

        // 计算符号坐标（保留原JS的坐标计算逻辑）
        jackpotNode.x = -2 * this.width + this.width * col * this.width;
        jackpotNode.y = this.height - this.height * row * this.height;

        // 构建动画名称并播放（3*列+行 拼接动画名）
        const animationName = `Fx_seven_move_${3 * col + row}`;
        const aniComponent = jackpotNode.getComponent(cc.Animation);
        if (TSUtility.isValid(aniComponent)) {
            aniComponent.stop();
            aniComponent.setCurrentTime(0);
            aniComponent.play(animationName);
        }

        // 1秒后触发顶部七星组件的激活状态
        this.scheduleOnce(() => {
            const topSevenComponent = SuperSevenBlastsManager.getInstance().game_components.topSevenComponent;
            if (TSUtility.isValid(topSevenComponent)) {
                topSevenComponent.setAlive();
            }
        }, 1);
    }

    /**
     * 播放激活特效与音效
     */
    public aliveFx(): void {
        // 停止并重新播放激活音效
        SlotSoundController.Instance().stopAudio("aliveSeven", "FX");
        SlotSoundController.Instance().playAudio("aliveSeven", "FX");

        // 显示并播放激活特效动画
        if (TSUtility.isValid(this.alive_Fx)) {
            this.alive_Fx.active = true;
            const aniComponent = this.alive_Fx.getComponent(cc.Animation);
            if (TSUtility.isValid(aniComponent)) {
                aniComponent.play();
            }
        }
    }

    /**
     * 清理所有动画节点（移除子节点+隐藏激活特效）
     */
    public clearAllAnis(): void {
        // 移除moveNode下所有子节点（true：销毁节点）
        this.moveNode?.removeAllChildren(true);
        // 隐藏激活特效
        this.alive_Fx.active = false;
    }
}