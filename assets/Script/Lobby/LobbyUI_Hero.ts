import AnimationButton from "../SubGame/AnimationButton";
import GameCommonSound from "../GameCommonSound";
import HeroMainPopup, { TypeHeroSubPopup } from "../Hero/HeroMainPopup";
import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
import UserInfo from "../User/UserInfo";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import HeroManager from "../manager/HeroManager";
import PopupManager from "../manager/PopupManager";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;




/**
 * 大厅英雄UI组件
 * 核心功能：英雄入口按钮控制、解锁判断、红点显示、弹窗交互
 */
@ccclass()
export default class LobbyUI_Hero extends LobbyUIBase {
    // ================= 组件绑定（与原代码property一一对应） =================
    @property(cc.Button)
    btnIcon: cc.Button = null;          // 英雄图标按钮
    @property(cc.Button)
    btnLock: cc.Button = null;          // 锁定按钮
    @property(AnimationButton)
    animButton: AnimationButton = null; // 动画按钮组件
    @property(cc.Node)
    nodeRedDot: cc.Node = null;         // 红点节点

    // ================= 访问器（原代码的eType getter） =================
    get eType(): LobbyUIType {
        return LobbyUIType.HERO;
    }

    // ================= 生命周期方法 =================
    /**
     * 组件加载时初始化
     * 绑定按钮事件、注册用户信息监听
     */
    onLoad(): void {
        // 绑定按钮点击事件（使用全局Utility工具类）
        this.btnIcon.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Hero", "onClick_Icon", "")
        );
        this.btnLock.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Hero", "onClick_Lock", "")
        );

        // // 注册用户信息监听事件
        // const userInfoIns = UserInfo.instance();
        // userInfoIns.addListenerTarget(UserInfo.MSG.UPDATE_LEVEL_UP, this.refresh.bind(this), this);
        // userInfoIns.addListenerTarget(UserInfo.MSG.ADD_NEW_HERO, this.refresh.bind(this), this);
        // userInfoIns.addListenerTarget(UserInfo.MSG.CHANGE_ACTIVE_HERO, this.refresh.bind(this), this);
    }

    /**
     * 组件销毁时清理
     * 移除监听、取消所有定时器
     */
    onDestroy(): void {
        //UserInfo.instance().removeListenerTargetAll(this);
        this.unscheduleAllCallbacks();
    }

    // ================= 核心业务方法 =================
    /**
     * 判断UI是否可用（是否解锁英雄功能）
     * @returns 可用返回true，否则false
     */
    isAvailableUI(): boolean {
        // 对比用户等级与英雄功能解锁等级
        return this.numUserLevel >= UnlockContentsManager.instance.getUnlockConditionLevel(
            UnlockContentsType.HERO
        );
    }

    /**
     * 刷新UI状态（锁定/可用、红点、动画）
     */
    refresh(): void {
        // 原代码中0/1表示false/true，TS中转换为布尔值
        const isAvailable = this.isAvailableUI();
        this.btnLock.node.active = !isAvailable;
        this.btnIcon.interactable = isAvailable;
        // 红点显示条件：UI可用 且 红点数量>0
        this.nodeRedDot.active = isAvailable && this.getRedDotCount() > 0;
        // 停止/启动动画按钮动画
        this.animButton.setStopAnimation(!isAvailable);
    }

    /**
     * 获取红点数量（是否有新英雄标签）
     * @returns 1表示有红点，0表示无
     */
    getRedDotCount(): number {
        return HeroManager.Instance().hasAnyNewTag() ? 1 : 0;
    }

    /**
     * 锁定按钮点击事件
     * 播放音效、显示解锁提示弹窗
     */
    onClick_Lock(): void {
        // 播放音效
        GameCommonSound.playFxOnce("btn_etc");
        // 打开解锁提示弹窗
        this.openTooltip({
            id: "LevelLockHero",
            nodeTarget: this.btnIcon.node,
            pos: cc.v2(0, 60),
            openTime: 3,
            level: UnlockContentsManager.instance.getUnlockConditionLevel(
                UnlockContentsType.HERO
            )
        });
    }

    /**
     * 英雄图标按钮点击事件
     * 播放音效、打开英雄主弹窗
     */
    onClick_Icon(): void {
        // 播放音效
        GameCommonSound.playFxOnce("btn_etc");
        
        // UI可用时才打开弹窗
        if (this.isAvailableUI()) {
            PopupManager.Instance().showDisplayProgress(true);
            // 获取英雄弹窗并打开
            HeroMainPopup.getPopup((err: any, popupIns: HeroMainPopup) => {
                PopupManager.Instance().showDisplayProgress(false);
                // 无错误时打开弹窗（TSUtility.isValid判断实例有效性）
                if (!TSUtility.isValid(err)) {
                    popupIns.open(TypeHeroSubPopup.none);
                }
            });
        }
    }
}