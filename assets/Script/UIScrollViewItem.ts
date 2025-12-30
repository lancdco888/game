const { ccclass, property } = cc._decorator;

// 导入工具类 保持原项目路径不变
import TSUtility from "./global_utility/TSUtility";

/**
 * 滚动列表子项通用基类 (继承cc.Component)
 * ✅ 核心设计：抽象基类，只封装【数据绑定+删除回调】通用逻辑，无任何UI渲染代码
 * ✅ 核心钩子：setData() 为空方法，由子类继承重写，实现具体的子项UI数据渲染
 * ✅ 核心能力：数据自动绑定、删除回调赋值、安全的节点删除方法、统一的数据读取入口
 * 所有滚动列表的子项预制体，都应挂载继承此类的脚本，实现标准化的子项开发
 */
@ccclass('UIScrollViewItem')
export default class UIScrollViewItem extends cc.Component {
    // ===== 私有核心成员变量 (原代码初始化值+类型 1:1完整保留) =====
    private _data: any = null;          // 绑定的子项数据 (对应UIScrollViewData实例)
    private _remove: Function | null = null; // 删除当前子项的回调函数 (由滚动视图传入)

    // ===== ✅ 核心访问器 - 数据绑定主入口 (原逻辑完整保留 重中之重) =====
    // 【核心特性】赋值data时，会自动触发setData()方法，子类重写该方法即可实现数据渲染
    public get data(): any {
        return this._data;
    }

    public set data(value: any) {
        this._data = value;
        this.setData(); // 赋值数据后立即执行渲染钩子
    }

    // ===== ✅ 只读删除回调 - 仅提供set赋值入口 无get (原逻辑完全一致) =====
    // 由父滚动视图绑定删除回调，当前子项仅保存回调引用，不对外暴露读取
    public set remove(callback: Function | null) {
        this._remove = callback;
    }

    // =========================================================================
    // ✅ 【核心空方法钩子】数据渲染入口 - 由子类继承重写实现UI渲染
    // 原代码为空方法，必须完整保留，这是基类的核心设计，子类重写此方法即可绑定数据渲染UI
    // =========================================================================
    public setData(): void { }

    // =========================================================================
    // ✅ 通用方法 - 获取当前子项的【业务数据】(封装层解耦)
    // 原逻辑固定返回：this.data.itemData → 对应UIScrollViewData的业务数据体，无修改
    // =========================================================================
    public getData(): any {
        return this.data.itemData;
    }

    // =========================================================================
    // ✅ 核心方法 - 安全删除当前子项 (原逻辑完整复刻 无任何修改)
    // 1. 安全校验：通过TSUtility判断删除回调是否有效 避免空指针报错
    // 2. 执行删除：调用回调函数 传入当前子项的索引 (this.data.itemIndex)
    // =========================================================================
    public removeNode(): void {
        if (TSUtility.isValid(this._remove)) {
            this._remove(this.data.itemIndex);
        }
    }
}