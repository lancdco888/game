// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import PopupManager from "../manager/PopupManager";
import RecentlyPlayedPopup from "../RecentlyPlayedPopup";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import { Utility } from "../global_utility/Utility";

/**
 * 老虎机横幅子项 - 最近游玩(RECENTLY)专属版
 * 继承基础横幅基类，核心扩展：绑定双按钮点击事件 → 点击打开【最近游玩】弹窗，专属用于最近游玩板块的横幅展示
 */
@ccclass
export default class LobbySlotBannerItem_RECENTLY extends LobbySlotBannerItem {
    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Button)
    public btn: cc.Button = null!;

    @property(cc.Button)
    public btnRight: cc.Button = null!;

    // ===================== 核心初始化方法 (原逻辑完整保留，按钮事件绑定规则一字未改) =====================
    public initialize(): void {
        // 给左侧按钮绑定点击事件：触发当前组件的 onClick 方法
        this.btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_RECENTLY", "onClick", ""));
        // 给右侧按钮绑定相同的点击事件，双按钮同逻辑触发
        this.btnRight.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_RECENTLY", "onClick", ""));
    }

    // ===================== 核心点击回调方法 (原业务逻辑完整保留，弹窗调用链路精准还原) =====================
    public onClick(): void {
        const self = this;
        // 显示全局加载进度条
        PopupManager.Instance().showDisplayProgress(true);
        // 获取最近游玩弹窗实例并执行回调
        RecentlyPlayedPopup.getPopup(function(isError: number, popup: RecentlyPlayedPopup) {
            // 隐藏全局加载进度条
            PopupManager.Instance().showDisplayProgress(false);
            // 无错误 → 隐藏当前横幅根节点 + 打开最近游玩弹窗并挂载节点
            if (!isError) {
                self.nodeRoot.active = false;
                popup.open(self.nodeRoot);
            }
        });
    }
}