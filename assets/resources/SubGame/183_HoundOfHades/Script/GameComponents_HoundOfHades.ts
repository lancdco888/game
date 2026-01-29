import GameComponents_Base from "../../../../Script/game/GameComponents_Base";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import HoundsComponent_HoundOfHades from "./HoundsComponent_HoundOfHades";
import JackpotDisplayFxComponent_HoundOfHades from "./JackpotDisplayFxComponent_HoundOfHades";
import JackpotMoneyDisplay from "./JackpotMoneyDisplay";
import JackpotResultPopup_HoundOfHades from "./JackpotResultPopup_HoundOfHades";
import LockComponent_HoundOfHades from "./LockComponent_HoundOfHades";
import LockNRollIntroPopup_HoundOfHades from "./LockNRollIntroPopup_HoundOfHades";
import LockNRollResultPopup_HoundOfHades from "./LockNRollResultPopup_HoundOfHades";
import LockNRollStartPopup_HoundOfHades from "./LockNRollStartPopup_HoundOfHades";
import MovePotComponent_HoundOfHades from "./MovePotComponent_HoundOfHades";
import RemainCountComponent_HoundOfHades from "./RemainCountComponent_HoundOfHades";
import TopUIComponent_HoundOfHades from "./TopUIComponent_HoundOfHades";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬游戏组件管理器
 * 继承自基础游戏组件类，管理该游戏的所有自定义组件和弹窗
 */
@ccclass()
export default class GameComponents_HoundOfHades extends GameComponents_Base {
    // ====== Cocos 组件属性（绑定到编辑器）======
    @property(TopUIComponent_HoundOfHades)
    public topUI: TopUIComponent_HoundOfHades = null;

    @property(cc.Node)
    public houndsComponent: cc.Node = null;

    @property(JackpotMoneyDisplay)
    public jackpotUI: JackpotMoneyDisplay = null;

    @property(JackpotDisplayFxComponent_HoundOfHades)
    public jackpotDisplayFX: JackpotDisplayFxComponent_HoundOfHades = null;

    @property(JackpotResultPopup_HoundOfHades)
    public jackpotResultPopup: JackpotResultPopup_HoundOfHades = null;

    @property(LockNRollResultPopup_HoundOfHades)
    public lockNRollResultPopup: LockNRollResultPopup_HoundOfHades = null;

    @property(LockNRollStartPopup_HoundOfHades)
    public lockNRollStartPopup: LockNRollStartPopup_HoundOfHades = null;

    @property(LockNRollIntroPopup_HoundOfHades)
    public lockNRollIntroPopup: LockNRollIntroPopup_HoundOfHades = null;

    @property(MovePotComponent_HoundOfHades)
    public movePot: MovePotComponent_HoundOfHades = null;

    @property(LockComponent_HoundOfHades)
    public lockComponent: LockComponent_HoundOfHades = null;

    @property(RemainCountComponent_HoundOfHades)
    public remainCount: RemainCountComponent_HoundOfHades = null;

    // ====== 私有成员变量 ======
    // 猎犬组件（从节点获取的实际组件实例）
    public _houndsComponent: HoundsComponent_HoundOfHades = null;
    // LockNRoll延迟标记
    private _lockNRollDelay: boolean = false;

    /**
     * 节点加载时初始化
     */
    onLoad() {
        super.onLoad();
        // 从绑定的节点获取猎犬组件实例
        if (this.houndsComponent) {
            this._houndsComponent = this.houndsComponent.getComponent(HoundsComponent_HoundOfHades);
        }
    }

    /**
     * 设置LockNRoll延迟标记
     * @param flag 延迟标记值
     */
    setLockNRollDelay(flag: boolean) {
        this._lockNRollDelay = flag;
    }

    /**
     * 获取LockNRoll延迟标记
     * @returns 延迟标记值
     */
    lockNRollNextDelay(): boolean {
        return this._lockNRollDelay;
    }

    /**
     * 获取期望概率（不同LockNRoll模式对应不同概率）
     * @returns 期望概率值（0-1之间）
     */
    getExpectRate(): number {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        
        switch (nextSubGameKey) {
            case "blue_red_green_locknroll":
                return 0.2;
            case "blue_red_locknroll":
            case "red_green_locknroll":
            case "red_locknroll":
                return 0.4;
            default:
                return 0.7;
        }
    }

    /**
     * 判断是否显示红色宝石
     * @returns 是否显示红色宝石
     */
    isShowRedGem(): boolean {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return [
            "blue_red_green_locknroll",
            "blue_red_locknroll",
            "red_green_locknroll",
            "red_locknroll"
        ].includes(nextSubGameKey);
    }

    /**
     * 判断是否显示蓝色宝石
     * @returns 是否显示蓝色宝石
     */
    isShowBlueGem(): boolean {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return [
            "blue_red_green_locknroll",
            "blue_red_locknroll",
            "blue_green_locknroll",
            "blue_locknroll"
        ].includes(nextSubGameKey);
    }

    /**
     * 判断是否显示绿色宝石
     * @returns 是否显示绿色宝石
     */
    isShowGreenGem(): boolean {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return [
            "blue_red_green_locknroll",
            "red_green_locknroll",
            "blue_green_locknroll",
            "green_locknroll"
        ].includes(nextSubGameKey);
    }
}