import Reel from "../../Slot/Reel";

const { ccclass, property } = cc._decorator;

/**
 * Super25Deluxe游戏卷轴实现类
 * 继承通用Reel基类，目前无额外自定义逻辑
 */
@ccclass() // 指定类名便于编辑器序列化识别
export default class Reel_Super25Deluxe extends Reel {
    constructor(){
        super()
    }
}
