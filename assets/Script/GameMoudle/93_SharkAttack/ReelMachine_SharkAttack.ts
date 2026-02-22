import ReelMachine_Base from "../../ReelMachine_Base";

const { ccclass } = cc._decorator;

/**
 * 鲨鱼攻击游戏滚轮机管理器
 * 继承自ReelMachine_Base，当前仅保留基础继承结构，无额外业务逻辑
 */
@ccclass('')
export default class ReelMachine_SharkAttack extends ReelMachine_Base {
    /**
     * 构造函数（继承父类逻辑）
     * 注：Cocos Creator中建议通过onLoad/start生命周期初始化，而非构造函数
     */
    constructor() {
        super(); // 调用父类构造函数，确保基类逻辑正常执行
    }
}