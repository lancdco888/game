// Cocos Creator 2.x 标准头部解构写法 (严格按你的要求置顶)
const { ccclass, property } = cc._decorator;

// 导入依赖模块 - 路径与原代码完全一致
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";

/**
 * 幸运转盘 玩法规则说明弹窗组件
 * 对应大奖转盘的【信息按钮】点击弹出的规则说明弹窗
 */
@ccclass
export default class ThrillJackpotInfoPopup extends cc.Component {
    // ===================== 序列化绑定属性 (与原代码完全一致，编辑器拖拽绑定) =====================
    @property(cc.Node)
    public block_BG: cc.Node = null;

    @property(cc.Button)
    public btnClose: cc.Button = null;

    // ===================== 生命周期回调 =====================
    onLoad(): void {
        // 适配遮罩背景尺寸为画布全屏大小
        if (TSUtility.isValid(this.block_BG)) {
            const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            if (TSUtility.isValid(canvas)) {
                this.block_BG.setContentSize(canvas.node.getContentSize());
            }
        }

        // 绑定关闭按钮的点击回调事件
        if (TSUtility.isValid(this.btnClose)) {
            this.btnClose.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ThrillJackpotInfoPopup", "onClickClose", "")
            );
        }
    }

    // ===================== 按钮点击回调 =====================
    /** 点击关闭按钮 - 触发弹窗隐藏 */
    public onClickClose(): void {
        this.hidePopup();
    }

    // ===================== 对外暴露核心方法 =====================
    /** 隐藏弹窗核心方法 - 仅修改节点显隐状态，原逻辑极简保留 */
    public hidePopup(): void {
        this.node.active = false;
    }
}