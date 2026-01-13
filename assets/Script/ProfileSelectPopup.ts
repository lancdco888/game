import DialogBase, { DialogState } from "./DialogBase";
import FBPictureSetter from "./FBPictureSetter";
import GameCommonSound from "./GameCommonSound";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import CommonServer from "./Network/CommonServer";
import ProfileAvatarSelectItem from "./ProfileAvatarSelectItem";
import ServiceInfoManager from "./ServiceInfoManager";
import TutorialCoinPromotion from "./TutorialCoinPromotion";
import UserInfo from "./User/UserInfo";
import { NewServiceIntroduceCoinPromotion } from "./User/UserPromotion";
import SDefine from "./global_utility/SDefine";
import { Utility } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;


/**
 * 个人资料选择弹窗（ProfileSelectPopup）
 * 负责头像选择、分页控制、头像修改提交、FB登录/游客用户特殊处理
 */
@ccclass()
export default class ProfileSelectPopup extends DialogBase {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Button)
    public okBtn: cc.Button | null = null; // 确认按钮

    @property(cc.Button)
    public cancleBtn: cc.Button | null = null; // 取消按钮

    @property(cc.Button)
    public leftPageMove: cc.Button | null = null; // 左分页按钮

    @property(cc.Button)
    public rightPageMove: cc.Button | null = null; // 右分页按钮

    @property()
    public avatarTemplate: ProfileAvatarSelectItem  = null; // 头像项模板

    @property(cc.Node)
    public pageTeimplate: cc.Node | null = null; // 分页模板

    @property(cc.PageView)
    public avatarPageView: cc.PageView | null = null; // 头像分页视图

    @property(cc.Node)
    public indicatorParentNode: cc.Node | null = null; // 分页指示器父节点

    @property(cc.Button)
    public indicatorTemplate: cc.Button | null = null; // 分页指示器模板

    // ================= 私有状态属性 =================
    private _checkAvatarId: string = ""; // 当前选中的头像ID
    private _initAvatarId: string = ""; // 初始头像ID（打开弹窗时的头像）
    private _profileAvatars: ProfileAvatarSelectItem[] = []; // 所有头像项列表

    // ================= 静态方法（弹窗加载） =================
    /**
     * 加载并创建弹窗实例
     * @param callback 回调函数 (err: 错误信息, popup: 弹窗实例)
     */
    public static getPopup(callback: (err: any, popup: ProfileSelectPopup | null) => void): void {
        const resPath = "Service/01_Content/Profile/ProfileSelectPopup";
        PopupManager.Instance().showDisplayProgress(true);

        cc.loader.loadRes(resPath, (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            
            if (err) {
                DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                callback(err, null);
                return;
            }

            // 实例化预制体并获取组件
            const popupNode = cc.instantiate(prefab as cc.Node);
            const popup = popupNode.getComponent(ProfileSelectPopup);
            popupNode.active = false;
            
            callback(null, popup);
        });
    }

    // ================= 生命周期函数 =================
    onLoad() {
        // 初始化弹窗基类
        this.initDailogBase();

        // 绑定按钮点击事件
        if (this.okBtn) {
            this.okBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onClickOK", "")
            );
        }
        if (this.cancleBtn) {
            this.cancleBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onClickCancle", "")
            );
        }
        if (this.leftPageMove) {
            this.leftPageMove.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onClickLeftPageMove", "")
            );
        }
        if (this.rightPageMove) {
            this.rightPageMove.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onClickRightPageMove", "")
            );
        }
        if (this.avatarPageView) {
            this.avatarPageView.pageEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onPageEvent", "")
            );
        }
    }

    // ================= 弹窗核心控制 =================
    /**
     * 打开弹窗
     */
    public open(): void {
        // 播放弹窗音效
        GameCommonSound.playFxOnce("pop_etc");

        // 初始化弹窗动画（淡入+缩放）
        this.rootNode.opacity = 0;
        this.rootNode.setScale(0.2, 0.2);
        const openAction = cc.spawn(
            cc.fadeIn(0.2),
            cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
        );
        this._open(openAction);

        // ========== 初始化头像列表 ==========
        const avatarItems: ProfileAvatarSelectItem[] = [];

        // 1. 添加FB头像（非游客用户）或游客头像（移动端+游客用户）
        if (!UserInfo.instance().isGuestUser()) {
            // 非游客：添加FB头像项
            const fbAvatarNode = cc.instantiate(this.avatarTemplate!.node);
            const fbAvatarItem = fbAvatarNode.getComponent(ProfileAvatarSelectItem)!;
            // fbAvatarItem.picImg.loadPictureByUrl(
            //     UserInfo.instance().getUserFBPicUrl(),
            //     FB_PICTURE_TYPE.NORMAL,
            //     null
            // );
            fbAvatarItem.avatarId = "-1";
            avatarItems.push(fbAvatarItem);
        } else if (Utility.isMobileGame()) {
            // 游客+移动端：添加游客头像项
            const guestAvatarNode = cc.instantiate(this.avatarTemplate!.node);
            const guestAvatarItem = guestAvatarNode.getComponent(ProfileAvatarSelectItem)!;
            guestAvatarItem.setGuest();
            guestAvatarItem.avatarId = "-2";
            avatarItems.push(guestAvatarItem);
        }

        // 2. 添加22个默认头像项
        for (let i = 0; i < 22; ++i) {
            const defaultAvatarNode = cc.instantiate(this.avatarTemplate!.node);
            const defaultAvatarItem = defaultAvatarNode.getComponent(ProfileAvatarSelectItem)!;
            defaultAvatarItem.loadProfileAvatarImg(i);
            avatarItems.push(defaultAvatarItem);
        }

        // 3. 获取当前用户头像ID，计算初始分页
        const currentAvatarId = FBPictureSetter.getAvatarIdFromPicUrl(UserInfo.instance().getUserPicUrl());
        this._initAvatarId = currentAvatarId;
        let initPageIndex = 0;

        // 4. 创建分页（每10个头像一页）
        const pageCount = Math.floor(avatarItems.length / 10);
        for (let i = 0; i <= pageCount; ++i) {
            const pageNode = cc.instantiate(this.pageTeimplate!);
            pageNode.setPosition(0, 0);
            this.avatarPageView!.addPage(pageNode);
        }

        // 5. 绑定头像项事件 + 分配到对应分页
        for (let i = 0; i < avatarItems.length; ++i) {
            const avatarItem = avatarItems[i];
            
            // 绑定头像点击事件
            avatarItem.selectBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onAvatarProfileClick", avatarItem.avatarId)
            );
            
            // 初始化选中状态
            avatarItem.setCheck(false);
            this._profileAvatars.push(avatarItem);

            // 分配到对应分页节点
            const pageIndex = Math.floor(i / 10);
            const pageContent = this.avatarPageView!.content.children[pageIndex].children[0];
            pageContent.addChild(avatarItem.node);

            // 记录初始选中头像所在分页
            if (currentAvatarId === avatarItem.avatarId) {
                initPageIndex = pageIndex;
            }
        }

        // 6. 选中初始头像
        this.checkAvatarItem(currentAvatarId, true);

        // 7. 销毁模板节点（避免冗余）
        this.pageTeimplate!.destroy();
        this.avatarTemplate!.node.destroy();

        // 8. 初始化分页指示器
        this.initInspector();

        // 9. 游客用户特殊处理（强制跳转到第0页）
        if (UserInfo.instance().isGuestUser()&& ServiceInfoManager.BOOL_FROM_PROFILE_INTRODUCE) {
            ServiceInfoManager.BOOL_FROM_PROFILE_INTRODUCE = false;
            initPageIndex = 0;
        }

        // 10. 滚动到初始分页 + 延迟刷新UI
        this.avatarPageView!.scrollToPage(initPageIndex, 0);
        this.scheduleOnce(() => {
            this.refreshUi();
        }, 0.1);
    }

    /**
     * 清空弹窗状态
     */
    public clear(): void {
        super.clear(); // 调用基类清空方法
        this.okBtn!.enabled = false;
        this.cancleBtn!.enabled = false;
    }

    /**
     * 关闭弹窗
     */
    public close(): void {
        if (this.isStateClose()) return;
        
        this.setState(DialogState.Close);
        this.clear();
        this._close(DialogBase.getFadeOutAction(0.3));
    }

    // ================= 按钮点击回调 =================
    /**
     * 确认按钮点击回调
     */
    public onClickOK(): void {
        GameCommonSound.playFxOnce("btn_etc");

        // 头像未修改：直接关闭
        if (this._initAvatarId === this._checkAvatarId) {
            this.close();
            return;
        }

        // 头像已修改：提交网络请求
        let newAvatarUrl = "";
        if (this._checkAvatarId === "-1") {
            // FB头像
            newAvatarUrl = UserInfo.instance().getUserFBPicUrl();
        } else {
            // 自定义头像
            newAvatarUrl = FBPictureSetter.getPicUrlFromAvatarId(this._checkAvatarId);
        }

        PopupManager.Instance().showDisplayProgress(true);
        CommonServer.Instance().requestChangeAvatarInfo(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            this._checkAvatarId,
            (response) => {
                PopupManager.Instance().showDisplayProgress(false);
                
                if (CommonServer.isServerResponseError(response)) {
                    cc.error(`requestChangeAvatarInfo fail ${JSON.stringify(response)}`);
                    return;
                }

                // 更新用户头像URL + 关闭弹窗
                UserInfo.instance().changeUserProfilePicUrl(newAvatarUrl);
                this.close();
            }
        );
    }

    /**
     * 取消按钮点击回调
     */
    public onClickCancle(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    /**
     * 左分页按钮点击回调
     */
    public onClickLeftPageMove(): void {
        GameCommonSound.playFxOnce("btn_etc");
        const targetPage = Math.max(this.avatarPageView!.getCurrentPageIndex() - 1, 0);
        this.setAvaterPageIndex(targetPage);
    }

    /**
     * 右分页按钮点击回调
     */
    public onClickRightPageMove(): void {
        GameCommonSound.playFxOnce("btn_etc");
        const maxPage = this.avatarPageView!.getPages().length - 1;
        const targetPage = Math.min(this.avatarPageView!.getCurrentPageIndex() + 1, maxPage);
        this.setAvaterPageIndex(targetPage);
    }

    /**
     * 分页指示器点击回调
     * @param _event 事件（未使用）
     * @param pageIndexStr 分页索引字符串
     */
    public onClickPageSelector(_event: any, pageIndexStr: string): void {
        GameCommonSound.playFxOnce("btn_etc");
        const pageIndex = parseInt(pageIndexStr);
        this.setAvaterPageIndex(pageIndex);
    }

    /**
     * 头像项点击回调
     * @param _event 事件（未使用）
     * @param avatarId 头像ID
     */
    public onAvatarProfileClick(_event: any, avatarId: string): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.checkAvatarItem(avatarId);
    }

    // ================= 头像选中逻辑 =================
    /**
     * 选中指定头像项
     * @param avatarId 头像ID
     * @param isInit 是否为初始化（跳过FB登录逻辑）
     */
    public checkAvatarItem(avatarId: string, isInit: boolean = false): void {
        const targetItem = this.getAvatarItem(avatarId);
        if (!targetItem) return;

        // 移动端+非初始化+游客头像：处理FB登录/金币引导
        if (Utility.isMobileGame && !isInit && avatarId === "-2") {
            const promotionInfo = UserInfo.instance().getPromotionInfo(NewServiceIntroduceCoinPromotion.PromotionKeyName);
            
            // // 金币引导可用：禁用按钮 + 领取金币
            // if (targetItem.introduce_Coin.active && promotionInfo && promotionInfo.enableSubStep(INTRODUCE_MAIN.INBOX, INTRODUCE_SUB.PROFILE_CONNECT)) {
            //     targetItem.getComponent(cc.Button).interactable = false;
            //     targetItem.introduce_Coin.getComponent(TutorialCoinPromotion).onCollect();
            //     return;
            // }

            // 金币引导不可用：处理FB登录
            if (!SDefine.Use_Mobile_Auth_v2) {
                // FacebookUtil.initAndLogin((loginResult) => {
                //     PopupManager.Instance().showDisplayProgress(false);
                //     if (loginResult === 1) {
                //         LocalStorageManager.setLoginTypeFacebook();
                //         PopupManager.Instance().showDisplayProgress(true);
                //         this.scheduleOnce(() => {
                //             HRVServiceUtil.restartGame();
                //         }, 0.1);
                //     }
                // });
            } else {
                UserInfo.instance().checkAndAccountLinkFacebook();
            }
            return;
        }

        // 切换选中状态
        if (avatarId !== this._checkAvatarId) {
            // 取消原选中项
            const oldSelectedItem = this.getAvatarItem(this._checkAvatarId);
            if (oldSelectedItem) {
                oldSelectedItem.setCheck(false);
            }
            // 选中新项
            targetItem.setCheck(true);
            this._checkAvatarId = avatarId;
        }
    }

    /**
     * 根据头像ID获取头像项
     * @param avatarId 头像ID
     * @returns 头像项（无则返回null）
     */
    public getAvatarItem(avatarId: string): ProfileAvatarSelectItem | null {
        for (const item of this._profileAvatars) {
            if (item.avatarId === avatarId) {
                return item;
            }
        }
        return null;
    }

    // ================= 分页指示器 =================
    /**
     * 初始化分页指示器
     */
    public initInspector(): void {
        const pageCount = this.avatarPageView!.content.childrenCount;
        
        for (let i = 0; i < pageCount; ++i) {
            // 实例化指示器节点
            const indicatorNode = cc.instantiate(this.indicatorTemplate!.node);
            const indicatorBtn = indicatorNode.getComponent(cc.Button)!;
            
            // 添加到父节点 + 绑定点击事件
            this.indicatorParentNode!.addChild(indicatorNode);
            indicatorBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "ProfileSelectPopup", "onClickPageSelector", i.toString())
            );
        }

        // 销毁指示器模板
        this.indicatorTemplate!.node.removeFromParent();
        this.indicatorTemplate!.node.destroy();
    }

    /**
     * 设置分页索引
     * @param pageIndex 目标分页索引
     * @param duration 滚动时长（默认0.3秒）
     */
    public setAvaterPageIndex(pageIndex: number, duration: number = 0.3): void {
        this.avatarPageView!.scrollToPage(pageIndex, duration);
    }

    /**
     * 分页切换事件回调
     */
    public onPageEvent(): void {
        this.refreshUi();
    }

    /**
     * 刷新UI（分页指示器+分页按钮状态）
     */
    public refreshUi(): void {
        const currentPage = this.avatarPageView!.getCurrentPageIndex();
        const maxPage = this.avatarPageView!.getPages().length - 1;

        // 1. 更新分页指示器选中状态
        for (let i = 0; i < this.indicatorParentNode!.childrenCount; i++) {
            const indicatorPoint = this.indicatorParentNode!.children[i].getChildByName("Point");
            indicatorPoint!.active = (i === currentPage);
        }

        // 2. 更新分页按钮显示状态
        this.leftPageMove!.node.active = (currentPage !== 0);
        this.rightPageMove!.node.active = (currentPage !== maxPage);
    }
}