// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 唯一依赖模块导入 - 路径与原混淆JS完全一致
import LobbySlotBannerItem from "../LobbySlotBannerItem";

/**
 * 老虎机横幅子项 - 空占位版 (纯继承空组件)
 * 继承核心横幅基类，无任何扩展属性/方法/逻辑，专用于「无横幅数据」时的占位填充，兜底使用
 */
@ccclass
export default class LobbySlotBannerItem_EMPTY extends LobbySlotBannerItem {
    // ✅ 纯空类，完全继承父类 LobbySlotBannerItem 的所有属性和方法
    // 无任何自定义属性、无任何重写方法、无任何业务逻辑
    constructor(){
        super()
    }
}