import FBPictureSetter from "./FBPictureSetter";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import UserInfo from "./User/UserInfo";
import { NewServiceIntroduceCoinPromotion } from "./User/UserPromotion";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import PopupManager from "./manager/PopupManager";
import MessageRoutingManager from "./message/MessageRoutingManager";

const { ccclass, property } = cc._decorator;
/**
 * 个人资料头像选择项（ProfileAvatarSelectItem）
 * 负责单个头像素材加载、游客头像显示、选中状态控制、FB登录/金币引导逻辑
 */
@ccclass()
export default class ProfileAvatarSelectItem extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(FBPictureSetter)
    public picImg: FBPictureSetter  = null; // 头像显示组件

    @property(cc.Node)
    public checkNode: cc.Node  = null; // 选中状态节点

    @property(cc.Button)
    public selectBtn: cc.Button  = null; // 选择按钮

    @property(cc.Node)
    public login_Node: cc.Node  = null; // 游客登录提示节点

    @property(cc.Node)
    public introduce_Coin: cc.Node  = null; // 金币引导节点

    // ================= 公共状态属性 =================
    public avatarId: string = ""; // 当前头像ID

    // ================= 静态属性（默认头像列表） =================
    public static list: string[] = [
        "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", 
        "111", "112", "201", "202", "203", "204", "301", "302", "303", "304", 
        "305", "306"
    ];

    // ================= 生命周期函数 =================
    onDestroy() {
        // 移动端+游客头像（avatarId=-2）：移除所有事件监听
        if (Utility.isMobileGame() && this.avatarId === "-2") {
            MessageRoutingManager.instance().removeListenerTargetAll(this);
        }
    }

    // ================= 核心业务逻辑 =================
    /**
     * 设置为游客头像（显示登录节点，隐藏头像，处理金币引导）
     */
    public setGuest(): void {
        // 显示登录节点，隐藏头像节点
        this.login_Node!.active = true;
        this.picImg!.node.active = false;

        // 获取金币引导配置
        const promotionInfo = UserInfo.instance().getPromotionInfo(NewServiceIntroduceCoinPromotion.PromotionKeyName);
        
        // // 金币引导可用：绑定事件 + 显示金币引导节点
        // if (promotionInfo && promotionInfo.enableSubStep(INTRODUCE_MAIN.INBOX, INTRODUCE_SUB.PROFILE_CONNECT)) {
        //     MessageRoutingManager.instance().addListenerTarget(
        //         MessageRoutingManager.MSG.UPDATE_SERVICE_INTRODUCE_COIN,
        //         this.updateServiceintroduce.bind(this),
        //         this
        //     );
        //     this.introduce_Coin!.active = true;
        // } else {
            // 金币引导不可用：隐藏金币引导节点
        this.introduce_Coin!.active = false;
        // }
    }

    /**
     * 加载默认头像资源
     * @param index 头像列表索引
     */
    public loadProfileAvatarImg(index: number): void {
        // 获取头像名称 + 设置avatarId
        this.avatarId = ProfileAvatarSelectItem.getPictureName(index);
        const resPath = `Img/ProfileAvatar/${this.avatarId}`;

        // 加载头像资源
        cc.loader.loadRes(resPath, (err, texture) => {
            if (err) {
                cc.error(`加载头像资源失败: ${resPath}`, err);
                return;
            }

            // 组件有效时设置精灵帧
            if (TSUtility.isValid(this)) {
                this.picImg!.sprite.spriteFrame = new cc.SpriteFrame(texture as any);
            }
        });
    }

    /**
     * 设置选中状态
     * @param isCheck 是否选中
     */
    public setCheck(isCheck: boolean): void {
        this.checkNode!.active = isCheck;
    }

    /**
     * 更新金币引导状态（事件回调）
     * @param msg 事件消息（默认空字符串）
     */
    public updateServiceintroduce(msg: string = ""): void {
        PopupManager.Instance().showDisplayProgress(false);

        // 仅处理profile_connect消息 + 游客头像
        if (msg === "profile_connect" && this.avatarId === "-2") {
            // 启用按钮 + 隐藏金币引导节点
            this.getComponent(cc.Button).interactable = true;
            this.introduce_Coin!.active = false;

            // 处理FB登录/账号绑定
            if (!SDefine.Use_Mobile_Auth_v2) {
                // FacebookUtil.initAndLogin((loginResult) => {
                //     PopupManager.Instance().showDisplayProgress(false);
                //     if (loginResult === 1) {
                //         // FB登录成功：设置登录类型 + 重启游戏
                //         LocalStorageManager.setLoginTypeFacebook();
                //         PopupManager.Instance().showDisplayProgress(true);
                //         this.scheduleOnce(() => {
                //             HRVServiceUtil.restartGame();
                //         }, 0.1);
                //     }
                // });
            } else {
                // 新版认证：检查并绑定FB账号
                UserInfo.instance().checkAndAccountLinkFacebook();
            }
        }
    }

    // ================= 静态方法 =================
    /**
     * 根据索引获取头像名称
     * @param index 头像列表索引
     * @returns 头像名称
     */
    public static getPictureName(index: number): string {
        return ProfileAvatarSelectItem.list[index];
    }
}