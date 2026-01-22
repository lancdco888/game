import DialogBase, { DialogState } from "./DialogBase";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import GameCommonSound from "./GameCommonSound";
import SetLabelWithMultiplier from "./SetLabelWithMultiplier";
import SlotPrefabManager from "./game/SlotPrefabManager";
import { Utility } from "./global_utility/Utility";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;



/**
 * 带分页功能的赔付表（PayTable）弹窗组件
 * 负责赔付表弹窗加载、倍数设置、分页切换、按钮交互、音效播放等核心逻辑
 */
@ccclass()
export default class PayTablePopup extends DialogBase {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Button, displayName: '返回游戏按钮' })
    returnGameBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: '左分页按钮' })
    leftBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: '右分页按钮' })
    rightBtn: cc.Button = null;

    // === 私有状态属性 ===
    private _pageRootNode: cc.Node = null; // 分页根节点（赔付表预制体节点）
    private _pageIndex: number = 0; // 当前分页索引

    /**
     * 静态方法：加载赔付表弹窗预制体并获取组件实例
     * @param callback 回调函数 (error: Error | null, popup: PayTablePopup | null)
     */
    static getPopup(callback: (error: Error | null, popup: PayTablePopup | null) => void): void {
        PopupManager.Instance().showDisplayProgress(true);
        const resPath = "Popup/Prefab/PayTablePopupPurple";

        // 加载弹窗预制体资源
        cc.loader.loadRes(resPath, (loadError: Error | null, prefab: any) => {
            PopupManager.Instance().showDisplayProgress(false);

            // 资源加载失败处理（记录异常日志 + 回调）
            if (loadError) {
                const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(loadError)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg));
                callback(loadError, null);
                return;
            }

            // 实例化预制体并获取组件
            const popupNode = cc.instantiate(prefab);
            const popupComp = popupNode.getComponent(PayTablePopup);
            popupNode.active = false;

            callback(null, popupComp);
        });
    }

    /**
     * 静态方法：打开赔付表弹窗（封装getPopup + open逻辑）
     * @param multiplier 倍数参数（用于设置赔付表标签）
     */
    static openPopup(multiplier: number): void {
        this.getPopup((error, popup) => {
            if (!error && popup) {
                popup.open(multiplier);
            }
        });
    }

    onLoad() {
        // 初始化弹窗基类
        this.initDailogBase();

        // 绑定按钮点击事件
        this.returnGameBtn.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "DialogBase", "onClickClose", "")
        );
        this.leftBtn.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "DialogBase", "onClickLeftBtn", "")
        );
        this.rightBtn.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "DialogBase", "onClickRightBtn", "")
        );
    }

    /**
     * 获取最大分页数（基于分页根节点的子节点数量）
     * @returns 最大分页数，无分页节点时返回0
     */
    getMaxPage(): number {
        return this._pageRootNode ? this._pageRootNode.childrenCount : 0;
    }

    /**
     * 设置当前分页（控制子节点显隐/透明度 + 按钮交互状态）
     * @param pageIndex 目标分页索引
     */
    setPage(pageIndex: number): void {
        if (!this._pageRootNode) return;

        this._pageIndex = pageIndex;

        // 遍历所有分页节点，仅显示当前页（透明度255），其余隐藏（透明度0）
        for (let i = 0; i < this._pageRootNode.childrenCount; ++i) {
            const pageNode = this._pageRootNode.children[i];
            pageNode.active = true;
            pageNode.opacity = i === pageIndex ? 255 : 0;
        }

        // 控制分页按钮交互状态（第一页左按钮禁用，最后一页右按钮禁用）
        this.leftBtn.interactable = pageIndex > 0;
        this.rightBtn.interactable = pageIndex < this.getMaxPage() - 1;
    }

    /**
     * 打开弹窗并初始化赔付表内容（含分页）
     * @param multiplier 倍数参数（>0时生效）
     * @returns 当前弹窗实例（链式调用支持）
     */
    open(multiplier: number): this {
        // 初始透明度设为0，通过淡入动画显示
        this.rootNode.opacity = 0;

        // 调用基类打开方法（淡入动画 + 回调初始化内容）
        this._open(cc.fadeIn(0.1), true, () => {
            // 校验SlotPrefabManager实例是否存在
            const prefabManager = SlotPrefabManager.Instance();
            if (!prefabManager) return;

            // 获取赔付表预制体
            const payTablePrefab = prefabManager.getPrefab("PayTable");
            if (!payTablePrefab) {
                cc.error("not found prefab: PayTable");
                return;
            }

            // 实例化赔付表预制体
            const payTableNode = cc.instantiate(payTablePrefab);
            if (!payTableNode) return;

            // 设置倍数（参数有效时）
            if (multiplier && multiplier > 0) {
                // 获取所有倍数标签组件并设置值
                const multiplierLabels = payTableNode.getComponentsInChildren(SetLabelWithMultiplier);
                for (let i = 0; i < multiplierLabels.length; ++i) {
                    multiplierLabels[i].setValue(multiplier);
                }
            }

            // 挂载赔付表节点并初始化分页
            payTableNode.active = true;
            this.rootNode.addChild(payTableNode);
            this._pageRootNode = payTableNode;
            this.setPage(0); // 默认显示第一页
        });

        return this;
    }

    /**
     * 关闭弹窗（校验状态 + 清理资源 + 调用基类关闭方法）
     */
    close(): void {
        if (this.isStateClose()) return;

        this.setState(DialogState.Close);
        this.clear(); // 清理弹窗资源（基类方法）
        this._close(null); // 调用基类关闭方法
    }

    /**
     * 左分页按钮点击回调（播放音效 + 切换上一页）
     */
    onClickLeftBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setPage(this._pageIndex - 1);
    }

    /**
     * 右分页按钮点击回调（播放音效 + 切换下一页）
     */
    onClickRightBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setPage(this._pageIndex + 1);
    }
}