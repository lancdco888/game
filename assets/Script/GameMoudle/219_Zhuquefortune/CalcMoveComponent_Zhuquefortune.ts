const { ccclass, property } = cc._decorator;

import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import JackpotSymbolComponent from "./JackpotSymbolComponent_Zhuquefortune";


/**
 * Jackpot 结算收集组件
 * 负责 Jackpot 收集时的移动动画、特效播放、预制体实例化，以及后续的动画清理工作
 */
@ccclass()
export default class CalcMoveComponent_Zhuquefortune extends cc.Component {
    @property(cc.Node)
    public move_Node: cc.Node = null;

    // Jackpot 收集激活特效节点（播放收集完成特效）
    @property(cc.Node)
    public alive_FX: cc.Node = null;

    // 移动预制体数组（对应 5 种 Jackpot 类型：mini/minor/major/mega/grand）
    @property([cc.Prefab])
    public move_Prefabs: cc.Prefab[] = [];

    constructor(){
        super()
    }

   
}