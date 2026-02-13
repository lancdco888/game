import ReelMachine_Base from "../../ReelMachine_Base";

const { ccclass } = cc._decorator;

/**
 * SuperSevenBlasts游戏的滚轮机组件
 * 继承自通用的滚轮基类ReelMachine_Base，暂未扩展额外逻辑
 */
@ccclass()
export default class ReelMachine_SuperSevenBlasts extends ReelMachine_Base {
    // 原JS中该类未定义额外的属性、方法，仅继承基类并标记为ccclass组件
    // 若后续需要扩展功能，可在此类中添加属性/方法
    constructor(){
        super()
    }
}