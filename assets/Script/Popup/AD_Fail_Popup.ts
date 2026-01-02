const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
//import FacebookUtil from "../Network/FacebookUtil";
import LocalStorageManager from "../manager/LocalStorageManager";
import SDefine from "../global_utility/SDefine";
import UserInfo from "../User/UserInfo";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import HRVServiceUtil from "../HRVService/HRVServiceUtil";

/**
 * 广告播放失败弹窗 - 继承DialogBase弹窗基类
 * 核心作用：广告加载/播放失败时展示的弹窗，游客账号引导FB登录绑定，普通账号直接关闭
 */
@ccclass
export default class AD_Fail_Popup extends DialogBase {
    // ✅ 原文件所有序列化属性 1:1复刻 装饰器+类型注解 命名完全一致
    @property(cc.Button)
    public ok_btn: cc.Button = null;

    @property
    public isGuest: boolean = false;

    // ==============================================================
    // ✅ 核心静态方法 - 弹窗获取入口 完全复刻原逻辑 加载资源/异常上报/进度条 一字不差
    // ==============================================================
    public static getPopup(isGuest: boolean, callback: (err: Error, popup: AD_Fail_Popup) => void): void {
        PopupManager.Instance().showDisplayProgress(true);
        // 区分游客版/普通版弹窗资源路径
        const resPath = isGuest ? "Service/00_Common/CommonPopup/ADFailPopup_Guest" : "Service/00_Common/CommonPopup/ADFailPopup";
        
        cc.loader.loadRes(resPath, (err: Error, prefab: cc.Prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                // 加载失败异常上报 - 原日志格式+上报逻辑完全复刻
                const error = new Error("cc.loader.loadRes fail %s: %s".format(resPath, JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback(err, null);
                return;
            }
            // 实例化预制体并获取组件
            const popupNode = cc.instantiate(prefab);
            const popupComp = popupNode.getComponent(AD_Fail_Popup);
            callback(null, popupComp);
        });
    }

    // ==============================================================
    // ✅ 生命周期+弹窗基类方法 完全复刻原逻辑 保留所有拼写/调用细节
    // ✔️ 重点：保留原文件【拼写笔误】initDailogBase 非 initDialogBase 绝对不修正
    // ==============================================================
    public onLoad(): void {
        this.initDailogBase();
    }

    /**
     * 打开弹窗 - 播放音效+弹窗缩放渐入动效 动效参数完全一致
     */
    public open(): void {
        GameCommonSound.playFxOnce("pop_etc");
        this.rootNode.opacity = 100;
        this.rootNode.setScale(0.2, 0.2);
        
        // 组合动作：淡入+缩放回弹 原文件缓动+时长参数完全保留
        const openAction = cc.spawn(cc.fadeIn(0.2), cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()));
        this._open(openAction);
    }

    // ==============================================================
    // ✅ 核心业务逻辑 onClickOk 按钮点击事件 1:1复刻所有分支判断 优先级最高
    // ✔️ 完整保留原文件 0==xxx /1==xxx 判断风格 ✔️ 分支顺序无变更 ✔️ 所有回调逻辑一致
    // ==============================================================
    public onClickOk(): void {
        const self = this;
        if (this.isGuest) {
            // 游客账号：分支判断 移动端鉴权版本
            if (!SDefine.Use_Mobile_Auth_v2) {
                // FacebookUtil.default.initAndLogin((loginResult: number) => {
                //     if (1 == loginResult) {
                //         // FB登录成功：存储登录类型 + 显示进度条 + 延迟重启游戏
                //         //LocalStorageManager.setLoginTypeFacebook();
                //         PopupManager.Instance().showDisplayProgress(true);
                //         self.scheduleOnce(() => {
                //             HRVServiceUtil.restartGame();
                //         }, 0.1);
                //     } else {
                //         // 登录失败/取消 关闭弹窗
                //         self.close();
                //     }
                // });
            } else {
                // 新版鉴权：直接走账号绑定逻辑
                UserInfo.instance().checkAndAccountLinkFacebook();
            }
        } else {
            // 非游客账号 直接关闭弹窗
            this.close();
        }
    }

    // ==============================================================
    // ✅ 弹窗关闭方法 完全复刻原弹窗基类的状态判断+清理逻辑 无任何修改
    // ==============================================================
    public close(): void {
        if (!this.isStateClose()) {
            this.setState(DialogState.Close);
            this.clear();
            this._close(null);
        }
    }
}