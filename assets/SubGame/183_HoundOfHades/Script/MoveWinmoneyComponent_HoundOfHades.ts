import TSUtility from "../../../Script/global_utility/TSUtility";
import ViewResizeManager from "../../../Script/global_utility/ViewResizeManager";
import SlotManager from "../../../Script/manager/SlotManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 奖金移动到赢钱标签组件
 * 核心职责：
 * 1. 监听视图大小调整并刷新特效位置
 * 2. 播放奖金从符号位置移动到赢钱标签的特效动画
 * 3. 激活赢钱特效并清理所有移动节点
 */
@ccclass()
export default class MoveWinmoneyComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 奖金移动特效预制体 */
    @property(cc.Prefab)
    public move_Prefab: cc.Prefab = null;

    /** 移动特效挂载的父节点 */
    @property(cc.Node)
    public move_Node: cc.Node = null;

    /** 赢钱激活特效节点（播放动画用） */
    @property(cc.Node)
    public alive_FX: cc.Node = null;

    // ====== 私有常量（位置计算基准值，原代码硬编码） ======
    /** 符号宽度（起始位置计算） */
    private readonly _Width: number = 160;
    /** 符号高度（起始位置计算） */
    private readonly _Height: number = 128;

    // ====== 生命周期方法 ======
    /**
     * 组件加载时添加视图大小调整监听
     */
    onLoad(): void {
        if (ViewResizeManager.Instance()) {
            ViewResizeManager.Instance().addHandler(this);
        } else {
            console.warn("MoveWinmoneyComponent: ViewResizeManager.Instance获取失败！");
        }
    }

    /**
     * 组件销毁时移除视图大小调整监听
     */
    onDestroy(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * 视图大小调整前的回调（空实现，保留扩展）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图大小调整中的回调（空实现，保留扩展）
     */
    onResizeView(): void {}

    /**
     * 视图大小调整后的回调（刷新特效位置）
     */
    onAfterResizeView(): void {
        this.refresh();
    }

    // ====== 核心方法 ======
    /**
     * 刷新赢钱激活特效的位置（对齐到赢钱标签）
     */
    refresh(): void {
        // 安全校验：核心节点缺失时返回
        if (!this.alive_FX || !SlotManager.Instance?.bottomUIText) {
            console.warn("MoveWinmoneyComponent: alive_FX未配置或SlotManager.bottomUIText不存在！");
            return;
        }

        // 获取赢钱标签节点
        const winMoneyLabelNode = SlotManager.Instance.bottomUIText.getWinMoneyLabel()?.node;
        if (!winMoneyLabelNode) {
            console.warn("MoveWinmoneyComponent: 未找到赢钱标签节点！");
            return;
        }

        // 计算赢钱标签的世界坐标，并转换为alive_FX父节点的本地坐标
        const winMoneyWorldPos = winMoneyLabelNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.alive_FX.getParent()?.convertToNodeSpaceAR(winMoneyWorldPos);
        
        // 设置alive_FX的位置
        if (localPos) {
            this.alive_FX.setPosition(localPos);
        }
    }

    /**
     * 播放奖金从指定行列位置移动到赢钱标签的特效
     * @param col 列索引（计算起始X坐标）
     * @param row 行索引（计算起始Y坐标）
     * @param callback 动画完成后的回调
     */
    playBonusMoveTartget(col: number, row: number, callback?: () => void): void {
        // 1. 基础参数校验
        if (typeof col !== 'number' || isNaN(col) || typeof row !== 'number' || isNaN(row)) {
            console.warn("MoveWinmoneyComponent: col和row必须为有效数字！");
            TSUtility.isValid(callback) && callback!();
            return;
        }
        if (!this.move_Prefab || !this.move_Node || !this.alive_FX) {
            console.warn("MoveWinmoneyComponent: move_Prefab/move_Node/alive_FX未配置！");
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 2. 刷新特效位置（确保对齐赢钱标签）
        this.refresh();

        // 3. 实例化移动特效预制体
        const moveNode = cc.instantiate(this.move_Prefab);
        if (!moveNode) {
            console.warn("MoveWinmoneyComponent: 实例化move_Prefab失败！");
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 4. 添加到父节点并设置起始位置
        this.move_Node.addChild(moveNode);
        moveNode.setPosition(
            -2 * this._Width + this._Width * col,
            this._Height - this._Height * row
        );

        // 5. 计算目标位置（赢钱标签在move_Node中的本地坐标）
        const winMoneyLabelNode = SlotManager.Instance.bottomUIText?.getWinMoneyLabel()?.node;
        if (!winMoneyLabelNode) {
            console.warn("MoveWinmoneyComponent: 未找到赢钱标签节点，终止特效播放！");
            moveNode.destroy();
            TSUtility.isValid(callback) && callback!();
            return;
        }
        const winMoneyWorldPos = winMoneyLabelNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const targetPos = this.move_Node.convertToNodeSpaceAR(winMoneyWorldPos);

        // 6. 播放移动动画（0.58秒时长）
        moveNode.runAction(cc.moveTo(0.58, targetPos.x, targetPos.y));

        // 7. 1秒后激活赢钱特效并执行回调
        this.scheduleOnce(() => {
            // 激活并播放赢钱特效动画
            this.alive_FX!.active = true;
            const aliveAni = this.alive_FX!.getComponent(cc.Animation);
            if (aliveAni) {
                aliveAni.stop();
                aliveAni.play();
                aliveAni.setCurrentTime(0);
            }

            // 执行回调
            TSUtility.isValid(callback) && callback!();
        }, 1);
    }

    /**
     * 清理所有移动特效节点并隐藏赢钱激活特效
     */
    clearAllAnis(): void {
        // 隐藏赢钱激活特效
        if (this.alive_FX) {
            this.alive_FX.active = false;
        }

        // 递归销毁所有移动特效子节点
        if (this.move_Node) {
            this.move_Node.removeAllChildren(true);
        } else {
            console.warn("MoveWinmoneyComponent: move_Node未配置，无法清理特效节点！");
        }
    }
}