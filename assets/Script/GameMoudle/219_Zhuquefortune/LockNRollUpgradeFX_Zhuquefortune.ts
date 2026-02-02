import SlotGameResultManager from "../../manager/SlotGameResultManager";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * Lock N Roll 升级特效组件
 * 负责根据下一个子游戏类型，切换并播放对应的升级特效动画
 */
@ccclass("LockNRollUpgradeFX_Zhuquefortune")
export default class LockNRollUpgradeFX_Zhuquefortune extends cc.Component {
    // 特效节点数组（对应不同子游戏类型：0=minor、1=major、2=mega/grand）
    @property([cc.Node])
    public fx_Nodes: cc.Node[] = [];

    // 特效核心动画组件（控制特效播放与停止）
    @property(cc.Animation)
    public fx_Animation: cc.Animation | null = null;

    /**
     * 展示升级特效（根据下一个子游戏类型切换对应特效节点，播放动画）
     */
    public showFX(): void {
        // 1. 激活当前特效根节点
        this.node.active = true;

        // 2. 获取下一个子游戏类型，匹配对应的特效索引
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        let targetFxIndex = 0;
        switch (nextSubGameKey) {
            case "lockNRoll_minor":
                targetFxIndex = 0;
                break;
            case "lockNRoll_major":
                targetFxIndex = 1;
                break;
            case "lockNRoll_mega":
            case "lockNRoll_grand":
                targetFxIndex = 2;
                break;
            default:
                cc.warn(`未知的 Lock N Roll 子游戏类型：${nextSubGameKey}，默认使用索引 0 特效`);
                targetFxIndex = 0;
                break;
        }

        // 3. 切换特效节点（仅激活目标索引节点，隐藏其他节点）
        this.fx_Nodes.forEach((node, index) => {
            node.active = index === targetFxIndex;
        });

        // 4. 重置并播放特效动画（保持原代码执行顺序，确保动画从头播放）
        this.fx_Animation?.stop();
        this.fx_Animation?.play();
        this.fx_Animation?.setCurrentTime(0);
    }

    /**
     * 隐藏升级特效（隐藏根节点，停止动画播放）
     */
    public hideFX(): void {
        // 1. 隐藏当前特效根节点
        this.node.active = false;

        // 2. 停止特效动画，防止残留动画逻辑
        this.fx_Animation?.stop();
    }
}