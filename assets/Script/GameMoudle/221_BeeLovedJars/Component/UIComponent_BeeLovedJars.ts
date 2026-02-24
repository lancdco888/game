import BeeLovedJarsManager from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏核心UI控制组件
 * 负责四种游戏模式（Base/Jackpot/FreeSpin/LockNRoll）下的UI节点显隐、reelMachine状态控制
 */
@ccclass('UIComponent_BeeLovedJars')
export default class UIComponent_BeeLovedJars extends cc.Component {
    // ===================== 核心UI节点配置 =====================
    /**
     * 不同模式的UI根节点数组（索引对应模式）：
     * 0 = Base模式 / 1 = Jackpot模式 / 2 = FreeSpin模式 / 3 = LockNRoll模式
     */
    @property({
        type: [cc.Node],
        displayName: "模式UI节点数组",
        tooltip: "索引0:Base 索引1:Jackpot 索引2:FreeSpin 索引3:LockNRoll"
    })
    ui_Nodes: cc.Node[] | null = [];

    /** 奖池节点（仅Base模式显示） */
    @property({
        type: cc.Node,
        displayName: "奖池节点",
        tooltip: "仅Base模式激活的奖池显示节点"
    })
    pot_Node: cc.Node | null = null;

    /** 大奖显示节点（Base/Jackpot模式显示） */
    @property({
        type: cc.Node,
        displayName: "大奖显示节点",
        tooltip: "Base/Jackpot模式激活的大奖展示节点"
    })
    jackpotDisplay_Node: cc.Node | null = null;

    /** 剩余次数节点（仅LockNRoll模式显示） */
    @property({
        type: cc.Node,
        displayName: "剩余次数节点",
        tooltip: "仅LockNRoll模式激活的剩余次数显示节点"
    })
    remain_Node: cc.Node | null = null;

    // ===================== 模式控制方法 =====================
    /**
     * 设置Base基础模式UI：
     * - ui_Nodes[0]激活，其余隐藏
     * - 显示奖池/大奖节点，显示滚轮机，隐藏剩余次数
     */
    setBase(): void {
        this.setUINodeActiveByIndex(0);
        
        // 控制特殊节点显隐
        this.pot_Node.active = true;
        this.jackpotDisplay_Node.active = true;
        this.setReelMachineActive(true);
        this.remain_Node.active = false;
    }

    /**
     * 设置Jackpot大奖模式UI：
     * - ui_Nodes[1]激活，其余隐藏
     * - 隐藏奖池、显示大奖节点，隐藏滚轮机，隐藏剩余次数
     */
    setJackpotMode(): void {
        this.setUINodeActiveByIndex(1);
        
        // 控制特殊节点显隐
        this.pot_Node.active = false;
        this.jackpotDisplay_Node.active = true;
        this.setReelMachineActive(false);
        this.remain_Node.active = false;
    }

    /**
     * 设置FreeSpin免费旋转模式UI：
     * - ui_Nodes[2]激活，其余隐藏
     * - 隐藏奖池/大奖节点，显示滚轮机，隐藏剩余次数
     */
    setFreeSpin(): void {
        this.setUINodeActiveByIndex(2);
        
        // 控制特殊节点显隐
        this.pot_Node.active = false;
        this.jackpotDisplay_Node.active = false;
        this.setReelMachineActive(true);
        this.remain_Node.active = false;
    }

    /**
     * 设置LockNRoll模式UI：
     * - ui_Nodes[3]激活，其余隐藏
     * - 隐藏奖池/大奖节点，显示滚轮机，显示剩余次数
     */
    setLockNRoll(): void {
        this.setUINodeActiveByIndex(3);
        
        // 控制特殊节点显隐
        this.pot_Node.active = false;
        this.jackpotDisplay_Node.active = false;
        this.setReelMachineActive(true);
        this.remain_Node.active = true;
    }

    // ===================== 私有辅助方法 =====================
    /**
     * 辅助方法：仅激活指定索引的ui_Nodes节点，其余隐藏
     * @param targetIndex 目标激活索引（0-3）
     */
    private setUINodeActiveByIndex(targetIndex: number): void {
        if (!this.ui_Nodes || this.ui_Nodes.length === 0) {
            console.warn("ui_Nodes数组未配置，跳过UI节点激活控制");
            return;
        }

        this.ui_Nodes.forEach((node, index) => {
            if (node && node.isValid) {
                node.active = index === targetIndex;
            }
        });
    }

    /**
     * 辅助方法：控制滚轮机节点显隐（添加空值安全检查）
     * @param isActive 是否激活
     */
    private setReelMachineActive(isActive: boolean): void {
        const manager = BeeLovedJarsManager.getInstance();
        if (manager && manager.reelMachine && manager.reelMachine.node && manager.reelMachine.node.isValid) {
            manager.reelMachine.node.active = isActive;
        } else {
            console.warn("BeeLovedJarsManager或reelMachine节点未找到，跳过滚轮机显隐控制");
        }
    }
}