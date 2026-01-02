const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import SDefine from "../global_utility/SDefine";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class RewardCenterMainButton_FanPage extends RewardCenterMainButton {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，直接拖拽绑定) ======================
    @property(cc.Button)
    private btnVisit: cc.Button = null;

    // ====================== 重写父类抽象方法 - 返回当前按钮类型【必须重写】 ======================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.FANPAGE;
    }

    // ====================== 静态校验方法 (全局通用，类直接调用，原JS逻辑完整保留) ======================
    /** 静态方法：是否可领取奖励 - 粉丝页按钮无奖励，固定返回false */
    public static isCanReceive(): boolean {
        this.isUseable();
        return false;
    }

    /** 静态方法：按钮是否可用 - 粉丝页按钮永久可用，固定返回true */
    public static isUseable(): boolean {
        return true;
    }

    // ====================== 重写父类保护方法 - 组件初始化【只执行一次】 ======================
    protected _initialize(): void {
        // 绑定访问粉丝页按钮的点击事件
        this.btnVisit.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_FanPage", "onClick_Visit", ""));
    }

    // ====================== 重写父类保护方法 - 实例化校验【供父类调用】 ======================
    /** 实例方法：是否可领取奖励 - 调用静态方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_FanPage.isCanReceive();
    }

    /** 实例方法：按钮是否可用 - 调用静态方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_FanPage.isUseable();
    }

    // ====================== 核心按钮点击事件回调 - 访问脸书粉丝页 ======================
    public onClick_Visit(): void {
        // 判断按钮是否可用
        if (this._isUseable()) {
            // 播放按钮点击音效
            GameCommonSound.playFxOnce("btn_etc");

            // 分支逻辑：脸书小游戏环境 / 普通网页环境
            if (Utility.isFacebookInstant()) {
                // FB小游戏环境 - 调用FB原生API关注粉丝页
                PopupManager.Instance().showDisplayProgress(true);
                // FBInstant.community.canFollowOfficialPageAsync().then((isAble: boolean) => {
                //     PopupManager.Instance().showDisplayProgress(false);
                //     // 支持关注则执行关注操作
                //     if (isAble) {
                //         FBInstant.community.followOfficialPageAsync();
                //     }
                // });
            } else {
                // 普通网页环境 - 直接打开粉丝页URL
                cc.sys.openURL(SDefine.FACEBOOK_FANPAGE_URL);
            }
        } else {
            // 按钮不可用时 更新视图状态
            this.updateView();
        }
    }
}