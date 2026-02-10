import FreeSpinResultPopup_LuckyBunnyDrop from "./FreeSpinResultPopup_LuckyBunnyDrop";
import FreeSpinRetriggerPopup_LuckyBunnyDrop from "./FreeSpinRetriggerPopup_LuckyBunnyDrop";
import FreeSpinStartPopup_LuckyBunnyDrop from "./FreeSpinStartPopup_LuckyBunnyDrop";
import JackpotResultPopup_LuckyBunnyDrop from "./JackpotResultPopup_LuckyBunnyDrop";
import LockAndRollComponent_LuckyBunnyDrop from "./LockAndRollComponent_LuckyBunnyDrop";
import LockAndRollRewardComponent_LuckyBunnyDrop from "./LockAndRollRewardComponent_LuckyBunnyDrop";
import LockAndRollStartPopup_LuckyBunnyDrop from "./LockAndRollStartPopup_LuckyBunnyDrop";
import LockWildComponent_LuckyBunnyDrop from "./LockWildComponent_LuckyBunnyDrop";
import TopUIComponent_LuckyBunnyDrop from "./TopUIComponent_LuckyBunnyDrop";


const { ccclass: ccclassDecorator, property: propertyDecorator } = cc._decorator;

@ccclassDecorator('GameComponent_LuckyBunnyDrop')
export default class GameComponent_LuckyBunnyDrop extends cc.Component {
    // 组件属性定义（与原JS保持完全一致）
    @propertyDecorator(TopUIComponent_LuckyBunnyDrop)
    public topUI: TopUIComponent_LuckyBunnyDrop | null = null;

    @propertyDecorator(LockWildComponent_LuckyBunnyDrop)
    public lockWild: LockWildComponent_LuckyBunnyDrop | null = null;

    @propertyDecorator(FreeSpinStartPopup_LuckyBunnyDrop)
    public freeSpinStartPopup: FreeSpinStartPopup_LuckyBunnyDrop | null = null;

    @propertyDecorator(FreeSpinRetriggerPopup_LuckyBunnyDrop)
    public freeSpinRetriggerPopup: FreeSpinRetriggerPopup_LuckyBunnyDrop | null = null;

    @propertyDecorator(FreeSpinResultPopup_LuckyBunnyDrop)
    public freeSpinResultPopup: FreeSpinResultPopup_LuckyBunnyDrop | null = null;

    @propertyDecorator(LockAndRollStartPopup_LuckyBunnyDrop)
    public lockAndRollStartPopup: LockAndRollStartPopup_LuckyBunnyDrop | null = null;

    @propertyDecorator(cc.Node)
    public normal_Reels: cc.Node | null = null;

    @propertyDecorator(cc.Node)
    public lockAndRoll_Reels: cc.Node | null = null;

    @propertyDecorator([cc.Node])
    public lockAndRoll_UI_Nodes: cc.Node[] = [];

    @propertyDecorator(LockAndRollRewardComponent_LuckyBunnyDrop)
    public lockAndRollRewardnUI: LockAndRollRewardComponent_LuckyBunnyDrop | null = null;

    @propertyDecorator(LockAndRollComponent_LuckyBunnyDrop)
    public lockAndRoll: LockAndRollComponent_LuckyBunnyDrop | null = null;

    @propertyDecorator(JackpotResultPopup_LuckyBunnyDrop)
    public jackpotResultPopup: JackpotResultPopup_LuckyBunnyDrop | null = null;

    @propertyDecorator(cc.Animation)
    public multiUI_Animation: cc.Animation | null = null;

    /**
     * 显示LockAndRoll相关UI
     */
    public showLockAndRollUI(): void {
        for (let e = 0; e < this.lockAndRoll_UI_Nodes.length; e++) {
            this.lockAndRoll_UI_Nodes[e].active = true;
        }
        this.multiUI_Animation?.play("UI_Multi_Idle_Ani");
        this.lockAndRollRewardnUI?.setRemainCount();
    }

    /**
     * 隐藏LockAndRoll相关UI
     */
    public hideLockAndRollUI(): void {
        for (let e = 0; e < this.lockAndRoll_UI_Nodes.length; e++) {
            this.lockAndRoll_UI_Nodes[e].active = false;
        }
    }

    /**
     * 增加剩余次数
     */
    public addRemainCount(): void {
        this.lockAndRollRewardnUI?.addRemainCount();
    }

    /**
     * 更新剩余次数
     */
    public updateRemainCount(): void {
        this.lockAndRollRewardnUI?.setRemainCount();
    }
}