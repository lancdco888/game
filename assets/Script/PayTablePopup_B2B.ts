import DialogBase, { DialogState } from "./DialogBase";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import SetLabelWithMultiplier from "./SetLabelWithMultiplier";
import SlotPrefabManager from "./game/SlotPrefabManager";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;


/**
 * B2B 模式赔付表（PayTable）弹窗组件
 * 负责赔付表弹窗的加载、显示、倍数设置、滚动页面挂载等核心逻辑
 */
@ccclass()
export default class PayTablePopup_B2B extends DialogBase {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Node, displayName: '滚动页面根节点' })
    rootScrollPage: cc.Node = null;

    /**
     * 静态方法：加载赔付表弹窗预制体并获取组件实例
     * @param callback 回调函数 (error: Error | null, popup: PayTablePopup_B2B | null)
     */
    static getPopup(callback: (error: Error | null, popup: PayTablePopup_B2B | null) => void): void {
        PopupManager.Instance().showDisplayProgress(true);
        const resPath = "Popup/Prefab/PayTablePopup_B2B";

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
            const popupComp = popupNode.getComponent(PayTablePopup_B2B);
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
    }

    /**
     * 打开弹窗并初始化赔付表内容
     * @param multiplier 倍数参数（>0时生效）
     * @returns 当前弹窗实例（链式调用支持）
     */
    open(multiplier: number): this {
        // 初始透明度设为0，通过淡入动画显示
        this.rootNode.opacity = 0;

        // 调用基类打开方法（淡入动画 + 回调初始化内容）
        this._open(cc.fadeIn(0.1), true, () => {
            // 校验SlotPrefabManager实例是否存在s
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

            // 将赔付表子节点挂载到滚动页面
            payTableNode.active = true;
            while (payTableNode.childrenCount > 0) {
                const childNode = payTableNode.children[0];
                childNode.removeFromParent(); // 从预制体实例移除
                childNode.height = 500; // 设置固定高度
                this.rootScrollPage.addChild(childNode); // 添加到滚动页面
                childNode.active = true;
            }
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
}