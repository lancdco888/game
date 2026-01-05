// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 唯一依赖模块导入 - 路径与原混淆JS完全一致
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";

/**
 * 通用广告横幅基础组件 (所有广告横幅的基类)
 * 继承cc.Component原生组件，核心功能：基础按钮绑定、弹窗关闭回调注册/执行、生命周期清理，所有广告横幅的统一基础封装，预留点击事件供子类重写
 */
@ccclass
export default class CommonBannerItem extends cc.Component {
    // ===================== 序列化绑定属性 (与原代码完全一致，仅1个核心属性) =====================
    @property(cc.Button)
    public btn: cc.Button = null!;

    // ===================== 私有成员变量 (原代码全部保留，补全精准TS类型注解，初始值完全一致) =====================
    private _popCloseCallback: Function | null = null;

    // ===================== 核心方法 - 注册弹窗关闭后的回调函数 (原逻辑完整保留，赋值回调引用) =====================
    public setOnPopupClose(callback: Function | null): void {
        this._popCloseCallback = callback;
    }

    // ===================== 生命周期 - 组件加载初始化 (原逻辑完整保留，按钮点击事件绑定，判空校验) =====================
    public onLoad(): void {
        if (this.btn) {
            this.btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "CommonBannerItem", "onClickBtn", ""));
        }
    }

    // ===================== 生命周期 - 组件销毁 (原逻辑完整保留，定时器清空，防内存泄漏基础处理) =====================
    public onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    // ===================== 预留点击事件方法 - 空实现，供子类重写业务逻辑 (原代码完整保留，核心设计) =====================
    public onClickBtn(): void { }

    // ===================== 核心回调触发方法 - 弹窗关闭后执行回调 (原逻辑完整保留，双重有效性校验+执行后置空引用) =====================
    public onPopupClose(): void {
        if (TSUtility.isValid(this) && this._popCloseCallback) {
            this._popCloseCallback();
            this._popCloseCallback = null;
        }
    }
}