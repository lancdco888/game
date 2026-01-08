const { ccclass, property } = cc._decorator;

/**
 * 通用模糊效果基类组件 (纯结构定义，无实际逻辑)
 * BlurEffect
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class BlurEffect extends cc.Component {
    // ===================== 私有成员变量 【与原JS完全对应，初始值均为1，添加@property装饰】 =====================
    @property()
    private _strength: number = 1;

    @property()
    private _heightStep: number = 1;

    @property()
    private _widthStep: number = 1;

    // ===================== 属性访问器 【严格还原原JS：getter返回私有变量，setter为空】 =====================
    @property()
    get strength(): number {
        return this._strength;
    }
    set strength(_: number) {
        // 原JS中setter为空，保持一致
    }

    @property()
    get heightStep(): number {
        return this._heightStep;
    }
    set heightStep(_: number) {
        // 原JS中setter为空，保持一致
    }

    @property()
    get widthStep(): number {
        return this._widthStep;
    }
    set widthStep(_: number) {
        // 原JS中setter为空，保持一致
    }

    // ===================== 静态方法 【与原JS一致，空实现】 =====================
    public static PreLoad(): void {
        // 原JS中静态方法为空，保持一致
    }

    // ===================== 生命周期方法 【与原JS一致，空实现】 =====================
    public onLoad(): void {
        // 原JS中onLoad为空，保持一致
    }

    public onDestroy(): void {
        // 原JS中onDestroy为空，保持一致
    }

    // ===================== 私有方法 【与原JS一致，空实现】 =====================
    private _use(): void {
        // 原JS中_use为空，保持一致
    }

    private _setProgram(): void {
        // 原JS中_setProgram为空，保持一致
    }

    private _resetProgram(): void {
        // 原JS中_resetProgram为空，保持一致
    }

    // ===================== 公共方法 【与原JS一致，空实现】 =====================
    public setProgram(): void {
        // 原JS中setProgram为空，保持一致
    }

    public resetProgram(): void {
        // 原JS中resetProgram为空，保持一致
    }
}