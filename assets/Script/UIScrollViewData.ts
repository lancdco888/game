const { ccclass, property } = cc._decorator;

/**
 * 滚动视图子项 数据封装基类 (继承cc.Component)
 * 通用型核心类 - 为ScrollView的每个子节点统一封装：子项索引、显示尺寸、绑定的业务数据
 * 所有滚动列表的子项脚本均可继承/挂载此类，统一管理数据与尺寸，无业务耦合
 */
@ccclass('UIScrollViewData')
export default class UIScrollViewData extends cc.Component {
    // ===== 私有核心成员变量 (原代码初始化值+类型 1:1完整保留) =====
    private _numIndex: number = 0;    // 子项在滚动列表中的索引位置
    private _itemSize: cc.Size = cc.size(0, 0); // 子项的显示尺寸(width/height)
    private _data: any = null;        // 子项绑定的业务数据（任意类型，按需赋值）

    // ===== 构造函数 (原逻辑完整复刻：接收子项尺寸作为入参并初始化) =====
    constructor(itemSize: cc.Size) {
        super();
        this._numIndex = 0;
        this._itemSize = itemSize;
        this._data = null;
    }

    // ===== ✅ 只读访问器 (原逻辑完整保留，无set，仅对外暴露读取能力) =====
    /** 获取子项在列表中的索引 */
    public get itemIndex(): number {
        return this._numIndex;
    }

    /** 获取子项的显示尺寸 */
    public get itemSize(): cc.Size {
        return this._itemSize;
    }

    /** 获取子项绑定的业务数据 */
    public get itemData(): any {
        return this._data;
    }

    // ===== ✅ 对外赋值方法 (原逻辑完整复刻，无任何逻辑修改) =====
    /** 绑定当前子项的业务数据 */
    public setData(data: any): void {
        this._data = data;
    }

    /** 设置当前子项在列表中的索引 */
    public setIndex(index: number): void {
        this._numIndex = index;
    }

    /** 重新设置当前子项的显示尺寸 */
    public setItemSize(size: cc.Size): void {
        this._itemSize = size;
    }
}