import FBPictureSetter from "../FBPictureSetter";
import GameCommonSound from "../GameCommonSound";
import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
import ProfileSelectPopup from "../ProfileSelectPopup";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo, { MSG } from "../User/UserInfo";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import LevelManager from "../manager/LevelManager";
import PopupManager from "../manager/PopupManager";
import MessageRoutingManager from "../message/MessageRoutingManager";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;

/**
 * 大厅个人资料UI组件（LobbyUI_Profile）
 * 负责用户头像显示、等级进度条更新、个人资料弹窗交互
 */
@ccclass()
export default class LobbyUI_Profile extends LobbyUIBase {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Button)
    public btnProfile: cc.Button = null; // 个人资料按钮

    @property(cc.Label)
    public lblLevel: cc.Label = null; // 等级标签

    @property(cc.ProgressBar)
    public bar: cc.ProgressBar = null; // 等级进度条

    @property()
    public pictureSetter: FBPictureSetter = null; // FB头像设置组件

    // ================= 只读属性（UI类型标识） =================
    public get eType(): LobbyUIType {
        return LobbyUIType.PROFILE;
    }

    // ================= 生命周期函数 =================
    onLoad() {
        // 绑定个人资料按钮点击事件
        if (this.btnProfile) {
            this.btnProfile.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "LobbyUI_Profile", "onClick_Profile", "")
            );
        }

        // 绑定用户头像更新事件
        UserInfo.instance().addListenerTarget(
            MSG.UPDATE_PICTURE,
            this.refresh.bind(this),
            this
        );
    }

    onDestroy() {
        // 移除所有事件监听 + 取消所有调度
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        UserInfo.instance().removeListenerTargetAll(this);
        this.unscheduleAllCallbacks();
    }

    // ================= 核心业务逻辑 =================
    /**
     * 刷新UI（头像 + 等级进度）
     */
    public refresh(): void {
        // 加载用户头像
        const userPicUrl = UserInfo.instance().getUserPicUrl();
        // if (TSUtility.isValid(userPicUrl) && userPicUrl.length > 0) {
        //     this.pictureSetter!.loadPictureByUrl(
        //         userPicUrl,
        //         FB_PICTURE_TYPE.NORMAL,
        //         null,
        //         () => {
        //             // 加载失败时清空头像
        //             this.pictureSetter!.image.spriteFrame = null;
        //         }
        //     );
        // }

        // 更新等级进度条
        this.updateLevelGauge(ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP);
    }

    /**
     * 更新等级进度条
     * @param exp 当前经验值
     */
    public updateLevelGauge(exp: number): void {
        // 计算经验百分比（限制0~1）
        const expPercent = Math.min(1, LevelManager.Instance().getLevelExpPercent(exp));
        // 根据经验值获取等级
        const level = LevelManager.Instance().getLevelFromExp(exp);

        // 更新用户等级 + 等级标签显示
        ServiceInfoManager.instance.setUserLevel(level);
        this.lblLevel!.string = `*${level.toString()}`;

        // 进度条处理：0则设0，小于0.1则设0.1，否则取实际值（避免进度条过短）
        this.bar!.progress = expPercent === 0 ? 0 : (expPercent < 0.1 ? 0.1 : expPercent);
    }

    /**
     * 个人资料按钮点击回调
     */
    public onClick_Profile(): void {
        // 检查是否启用（原代码isEnableIntroduce逻辑，此处保留判断）
        if (this.isEnableIntroduce()) return;

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 打开个人资料选择弹窗
        ProfileSelectPopup.getPopup((err, popup) => {
            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);
            
            // 无错误时打开弹窗，绑定关闭回调刷新UI
            if (!TSUtility.isValid(err)) {
                popup.setCloseCallback(this.refresh.bind(this));
                popup.open();
            }
        });
    }

    /**
     * 检查是否启用引导（原代码逻辑占位，需根据实际业务补充）
     * @returns 是否启用
     */
    public isEnableIntroduce(): boolean {
        // 原代码未实现具体逻辑，此处返回false保持原有行为
        return false;
    }
}