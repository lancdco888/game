import ReelMachine_Base from "../../ReelMachine_Base";


// 解构获取ccclass装饰器（用于类的序列化标记）
const { ccclass } = cc._decorator;

/**
 * Super25Deluxe游戏专属转轮机器类
 * 继承自公共基础转轮机器类，用于实现该游戏的转轮逻辑
 * 目前无额外扩展逻辑，直接复用基础类功能
 */
@ccclass('ReelMachine_Super25Deluxe') // 指定类名便于编辑器识别
export default class ReelMachine_Super25Deluxe extends ReelMachine_Base {
    // 构造函数自动继承父类，无额外初始化逻辑时可省略显式定义
    constructor(){
        super()
    }
}
