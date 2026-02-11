import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";

const { ccclass } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）专属数字滚动组件
 * 继承自通用 ChangeNumberComponent，目前保留空实现，预留后续专属扩展入口
 */
@ccclass()
export default class ChangeNumberComponent_TwilightDragon extends ChangeNumberComponent {
    // ======================================
    // Cocos 生命周期函数：节点加载完成时执行
    // ======================================
    onLoad(): void {
        // 空实现，保留父类核心逻辑（无需重写）
        // 后续如需扩展专属功能（如奖金格式化、自定义滚动速度），可在此添加或重写父类方法
        super.onLoad(); // 可选：调用父类 onLoad 方法，保证通用逻辑正常执行
    }
}