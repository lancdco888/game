import TSUtility from "../../global_utility/TSUtility";
import SlotManager from "../../manager/SlotManager";

const { ccclass, property } = cc._decorator;

/**
 * 滚轮背景状态枚举（对应原JS匿名枚举）
 */
export enum ReelBGState {
    NONE = 0,
    BASE_NORMAL = 1,
    BASE_EXPECT = 2,
    RESPIN_NORMAL = 3,
    RESPIN_EXPECT = 4
}

/**
 * SuperSevenBlasts 滚轮背景组件（控制不同状态的背景、动画、特效）
 */
@ccclass('ReelBGComponent_SuperSevenBlasts')
export default class ReelBGComponent_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 基础游戏背景节点 */
    @property(cc.Node)
    public base_BG: cc.Node = null;

    /** 重旋转游戏背景节点 */
    @property(cc.Node)
    public respin_BG: cc.Node = null;

    /** 基础期望状态节点 */
    @property(cc.Node)
    public base_Expect_Node: cc.Node = null;

    /** 重旋转期望状态节点 */
    @property(cc.Node)
    public respin_Expect_Node: cc.Node = null;

    /** 基础框架节点 */
    @property(cc.Node)
    public base_Frame_Node: cc.Node = null;

    /** 重旋转框架节点 */
    @property(cc.Node)
    public respin_Frame_Node: cc.Node = null;

    /** 基础普通状态动画 */
    @property(cc.Animation)
    public base_Normal_Ani: cc.Animation = null;

    /** 重旋转普通状态动画 */
    @property(cc.Animation)
    public respin_Normal_Ani: cc.Animation = null;

    /** 基础期望状态动画数组 */
    @property([cc.Animation])
    public base_Expect_Ani: cc.Animation[] = [];

    /** 重旋转期望状态动画数组 */
    @property([cc.Animation])
    public respin_Expect_Ani: cc.Animation[] = [];

    /** 暗化节点数组（对应5列滚轮） */
    @property([cc.Node])
    public dimmed_Nodes: cc.Node[] = [];

    /** 旋转特效节点数组 */
    @property([cc.Node])
    public spin_Fxs: cc.Node[] = [];

    // ========== 私有状态属性 ==========
    /** 当前背景状态 */
    private _currentState: ReelBGState = ReelBGState.NONE;

    /**
     * 设置基础普通状态（BASE_NORMAL）
     */
    public setBaseNormal(): void {
        if (this._currentState === ReelBGState.BASE_NORMAL) return;

        // 更新当前状态
        this._currentState = ReelBGState.BASE_NORMAL;

        // 切换背景节点显隐
        this.base_BG.active = true;
        this.respin_BG.active = false;

        // 切换期望节点显隐
        this.base_Expect_Node.active = true;
        this.respin_Expect_Node.active = false;

        // 隐藏基础框架节点
        this.base_Frame_Node.active = false;

        // 播放基础期望状态停留动画
        this.base_Expect_Ani.forEach(ani => {
            if (TSUtility.isValid(ani)) {
                ani.play("Main_Frame_Blue_light_stay");
            }
        });

        // 播放基础普通状态动画
        this.base_Normal_Ani?.play("Main_Frame_blue");

        // 隐藏所有暗化节点
        this.hideDimmNodes();
    }

    /**
     * 设置基础期望状态（BASE_EXPECT）
     */
    public setBaseExpect(): void {
        if (this._currentState === ReelBGState.BASE_EXPECT) return;

        // 更新当前状态
        this._currentState = ReelBGState.BASE_EXPECT;

        // 切换期望节点显隐（修复原代码重复设置base_Expect_Node.active的问题）
        this.base_Expect_Node.active = true;
        this.respin_Expect_Node.active = false;

        // 显示基础框架节点并播放动画
        this.base_Frame_Node.active = true;
        const baseFrameAni = this.base_Frame_Node?.getComponent(cc.Animation);
        baseFrameAni.play();

        // 播放基础期望状态动画
        this.base_Expect_Ani.forEach(ani => {
            if (TSUtility.isValid(ani)) {
                ani.play("Main_Frame_Blue_light");
            }
        });

        // 播放基础普通状态停留动画
        this.base_Normal_Ani?.play("Main_Frame_blue_stay");
    }

    /**
     * 设置重旋转普通状态（RESPIN_NORMAL）
     */
    public setRespinNormal(): void {
        if (this._currentState === ReelBGState.RESPIN_NORMAL) return;

        // 更新当前状态
        this._currentState = ReelBGState.RESPIN_NORMAL;

        // 切换背景节点显隐
        this.base_BG.active = false;
        this.respin_BG.active = true;

        // 切换期望节点显隐
        this.base_Expect_Node.active = false;
        this.respin_Expect_Node.active = true;

        // 隐藏重旋转框架节点
        this.respin_Frame_Node.active = false;

        // 播放重旋转期望状态停留动画
        this.respin_Expect_Ani.forEach(ani => {
            if (TSUtility.isValid(ani)) {
                ani.play("Main_Frame_Purple_light_stay");
            }
        });

        // 播放重旋转普通状态动画
        this.respin_Normal_Ani?.play("Main_Frame_Purple");

        // 隐藏所有暗化节点
        this.hideDimmNodes();
    }

    /**
     * 设置重旋转期望状态（RESPIN_EXPECT）
     */
    public setRespinExpect(): void {
        if (this._currentState === ReelBGState.RESPIN_EXPECT) return;

        // 更新当前状态
        this._currentState = ReelBGState.RESPIN_EXPECT;

        // 切换背景节点显隐
        this.base_BG.active = false;
        this.respin_BG.active = true;

        // 切换期望节点显隐
        this.base_Expect_Node.active = false;
        this.respin_Expect_Node.active = true;

        // 显示重旋转框架节点并播放动画
        this.respin_Frame_Node.active = true;
        const respinFrameAni = this.respin_Frame_Node?.getComponent(cc.Animation);
        respinFrameAni?.play();

        // 播放重旋转期望状态动画
        this.respin_Expect_Ani.forEach(ani => {
            if (TSUtility.isValid(ani)) {
                ani.play("Main_Frame_Purple_light");
            }
        });

        // 播放重旋转普通状态停留动画
        this.respin_Normal_Ani?.play("Main_Frame_Purple_stay");
    }

    /**
     * 显示奖励特效（重置状态为NONE）
     */
    public showBonusFx(): void {
        this._currentState = ReelBGState.NONE;

        // 播放基础期望状态动画
        this.base_Expect_Ani.forEach(ani => {
            if (TSUtility.isValid(ani)) {
                ani.play("Main_Frame_Blue_light");
            }
        });

        // 播放基础普通状态停留动画
        this.base_Normal_Ani?.play("Main_Frame_blue_stay");
    }

    /**
     * 设置指定列不暗化（其余列暗化）
     * @param columnIndex 不暗化的列索引（0-4）
     */
    public setDimmExepct(columnIndex: number): void {
        // 遍历前5个暗化节点（对应5列滚轮）
        this.dimmed_Nodes.slice(0, 5).forEach((node, index) => {
            if (TSUtility.isValid(node)) {
                node.active = index !== columnIndex;
            }
        });
    }

    /**
     * 隐藏所有暗化节点
     */
    public hideDimmNodes(): void {
        // 遍历前5个暗化节点（对应5列滚轮）
        this.dimmed_Nodes.slice(0, 5).forEach(node => {
            if (TSUtility.isValid(node)) {
                node.active = false;
            }
        });
    }

    /**
     * 显示旋转特效（根据滚轮激活状态）
     */
    public showSpinFx(): void {
        const reels = SlotManager.Instance.reelMachine?.reels;
        if (!reels) return;

        this.spin_Fxs.forEach((fxNode, index) => {
            if (TSUtility.isValid(fxNode) && reels[index]?.node) {
                fxNode.active = reels[index].node.active;
            }
        });
    }

    /**
     * 停止指定列的旋转特效
     * @param columnIndex 列索引（0-4）
     */
    public stopSpinFx(columnIndex: number): void {
        const fxNode = this.spin_Fxs[columnIndex];
        if (TSUtility.isValid(fxNode)) {
            fxNode.active = false;
        }
    }

    /**
     * 隐藏所有旋转特效
     */
    public hideSpinFx(): void {
        this.spin_Fxs.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.active = false;
            }
        });
    }
}