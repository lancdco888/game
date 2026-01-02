const { ccclass, property } = cc._decorator;

// ===================== 原文件唯一导入模块 路径完全不变 =====================
import GameCommonSound from "../GameCommonSound";

// ===================== 百夫长福利大盒子核心组件 继承cc.Component =====================
@ccclass
export default class CenturionCliqueInfoBigBox extends cc.Component {
    // ===================== 序列化绑定节点属性 原数据完整保留 类型精准匹配 =====================
    @property([cc.Node])
    private listInfoBoxes: cc.Node[] = [];

    @property(cc.Button)
    private btnClose: cc.Button = null;

    @property(cc.Button)
    private btnArrowLeft: cc.Button = null;

    @property(cc.Button)
    private btnArrowRight: cc.Button = null;

    // ===================== 私有成员变量 原数据完整保留 =====================
    private _indexCurrentBox: number = 0;
    private _callbackOnHide: Function = null;

    // ===================== 生命周期 - 组件加载 按钮事件绑定 =====================
    protected onLoad(): void {
        this.btnClose.node.on("click", this.onClickClose, this);
        this.btnArrowLeft.node.on("click", this.onClickArrowLeft, this);
        this.btnArrowRight.node.on("click", this.onClickArrowRight, this);
    }

    // ===================== 公有核心方法 - 显示大盒子 传入初始索引+隐藏回调 =====================
    public show(initIndex: number, hideCallback: Function): void {
        this._callbackOnHide = hideCallback;
        this.setCurrentBox(initIndex);
        this.node.active = true;
    }

    // ===================== 公有核心方法 - 隐藏大盒子 执行回调 =====================
    public hide(): void {
        this.node.active = false;
        if (this._callbackOnHide) {
            this._callbackOnHide();
        }
    }

    // ===================== 私有核心方法 - 设置当前显示的盒子 边界校验+显隐控制+按钮状态 =====================
    private setCurrentBox(targetIndex: number): void {
        // 边界值安全校验
        if (targetIndex < 0) {
            this._indexCurrentBox = 0;
        } else if (targetIndex >= this.listInfoBoxes.length) {
            this._indexCurrentBox = this.listInfoBoxes.length - 1;
        } else {
            this._indexCurrentBox = targetIndex;
        }

        // 遍历控制子盒子显隐
        this.listInfoBoxes.forEach((boxNode, index) => {
            boxNode.active = index === this._indexCurrentBox;
        });

        // 左右箭头可交互状态控制
        this.btnArrowLeft.interactable = this._indexCurrentBox > 0;
        this.btnArrowRight.interactable = this._indexCurrentBox < this.listInfoBoxes.length - 1;
    }

    // ===================== 按钮点击事件 - 关闭大盒子 =====================
    private onClickClose(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.hide();
    }

    // ===================== 按钮点击事件 - 上一页 =====================
    private onClickArrowLeft(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setCurrentBox(this._indexCurrentBox - 1);
    }

    // ===================== 按钮点击事件 - 下一页 =====================
    private onClickArrowRight(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setCurrentBox(this._indexCurrentBox + 1);
    }
}