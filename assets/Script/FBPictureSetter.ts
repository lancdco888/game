import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";

const { ccclass, property } = cc._decorator;

export type FB_PICTURE_TYPE = typeof FBPictureSetter.FB_PICTURE_TYPE[keyof typeof FBPictureSetter.FB_PICTURE_TYPE];
/**
 * FB/自定义头像设置组件（FBPictureSetter）
 * 负责FB头像（不同尺寸）、自定义头像（hrvavatar协议）的加载与显示
 */
@ccclass("FBPictureSetter")
export default class FBPictureSetter extends cc.Component {
    // ================= 枚举定义（FB头像尺寸） =================
    public static readonly FB_PICTURE_TYPE = {
        SMALL: "small",
        NORMAL: "normal",
        LARGE: "large",
        SQUARE: "square"
    } as const;
    // 导出类型别名，方便外部使用
   

    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Sprite)
    public sprite: cc.Sprite  = null; // 头像显示精灵组件

    // ================= 实例状态属性 =================
    public imgUrl: string = ""; // 当前加载的头像URL

    // ================= 只读访问器 =================
    public get image(): cc.Sprite  {
        return this.sprite;
    }

    // ================= 生命周期函数 =================
    onLoad() {
        // 原代码空实现，保留以兼容子类扩展
    }

    // ================= 核心业务逻辑 =================
    /**
     * 根据URL加载头像
     * @param url 头像URL（FB地址/自定义hrvavatar协议/空）
     * @param type FB头像尺寸类型（SMALL/NORMAL/LARGE/SQUARE）
     * @param successCb 加载成功回调（可选）
     * @param failCb 加载失败回调（可选）
     */
    public loadPictureByUrl(
        url: string,
        type: FB_PICTURE_TYPE,
        successCb?: () => void,
        failCb?: () => void
    ): void {
        // 补充默认参数（兼容原代码）
        successCb = successCb ?? null;
        failCb = failCb ?? null;

        cc.log(`loadPictureByUrl ${url}`);
        
        // URL为空：直接执行失败回调
        if (url === "") {
            failCb && failCb();
            return;
        }

        // 记录URL + 加载头像
        this.imgUrl = url;
        FBPictureSetter.loadProfilePicture(url, type, this.sprite, successCb, failCb);
    }

    // ================= 静态工具方法 =================
    /**
     * 加载头像（核心逻辑：区分远程FB URL/本地自定义头像）
     * @param url 头像URL
     * @param type FB头像尺寸类型
     * @param targetSprite 目标精灵组件
     * @param successCb 成功回调
     * @param failCb 失败回调
     */
    public static loadProfilePicture(
        url: string,
        type: FB_PICTURE_TYPE,
        targetSprite: cc.Sprite | null,
        successCb?: () => void,
        failCb?: () => void
    ): void {
        failCb = failCb ?? null;
        cc.log(`loadProfilePicture ${url}`);

        // URL为空：执行失败回调
        if (url === "") {
            failCb && failCb();
            return;
        }

        let loadUrl = "";
        // 1. 远程URL（含FB地址）
        if (url.indexOf("http") !== -1) {
            loadUrl = url;

            // 非FB小游戏环境 + FB头像URL：拼接access_token和尺寸参数
            if (!Utility.isFacebookInstant() && url.indexOf("https://graph.facebook.com") !== -1) {
                loadUrl = `${url}?type=${type}&access_token=${"FacebookUtil.m_fbAccessToken"}`;
            }

            // 加载远程图片
            cc.loader.load({ url: loadUrl, type: "png" }, (err, texture) => {
                // 精灵组件已销毁：直接返回
                if (!TSUtility.isValid(targetSprite)) {
                    cc.log("not found this node");
                    return;
                }

                // 加载失败：执行失败回调
                if (err) {
                    cc.log(`loadPictureByUrl error ${JSON.stringify(err)}`);
                    failCb && failCb();
                    return;
                }

                // 加载成功：设置SpriteFrame + 执行成功回调
                if (texture instanceof cc.Texture2D) {
                    targetSprite.spriteFrame = new cc.SpriteFrame(texture);
                    successCb && successCb();
                }
            });
        }
        // 2. 自定义头像协议（hrvavatar://）
        else if (FBPictureSetter.isProfileAvatarURL(url)) {
            // 解析头像ID + 获取本地资源路径
            const avatarId = FBPictureSetter.getAvatarIdFromPicUrl(url);
            loadUrl = FBPictureSetter.getResourcesPathFromAvatarId(avatarId);
            cc.log(`loadProfilePicture2 ${loadUrl}`);

            // 加载本地头像资源
            cc.loader.loadRes(loadUrl, (err, texture) => {
                // 加载失败：执行失败回调
                if (err) {
                    cc.log(`loadPictureByUrl error ${JSON.stringify(err)}`);
                    failCb && failCb();
                    return;
                }

                // 精灵组件有效：设置SpriteFrame + 成功回调
                if (TSUtility.isValid(targetSprite)) {
                    targetSprite.spriteFrame = new cc.SpriteFrame(texture as cc.Texture2D);
                    successCb && successCb();
                } else {
                    // 精灵组件销毁：执行失败回调
                    failCb && failCb();
                }
            });
        }
        // 3. 无效URL
        else {
            cc.error(`invalid pic url ${url}`);
            failCb && failCb();
        }
    }

    /**
     * 加载头像并返回SpriteFrame（供外部调用）
     * @param url 头像URL
     * @param type FB头像尺寸类型
     * @param callback 回调函数（参数：SpriteFrame | null）
     */
    public static loadProfilePictureForSpriteFrame(
        url: string,
        type: FB_PICTURE_TYPE,
        callback: (spriteFrame: cc.SpriteFrame | null) => void
    ): void {
        cc.log(`loadProfilePictureForSpriteFrame ${url}`);
        
        if (url !== "") {
            ProfileImageManager.loadProfileImage(url, type, callback);
        } else {
            callback && callback(null);
        }
    }

    /**
     * 判断是否为自定义头像URL（hrvavatar协议）
     * @param url 待判断URL
     * @returns 是否为自定义头像URL
     */
    public static isProfileAvatarURL(url: string): boolean {
        return url.indexOf("hrvavatar://") !== -1;
    }

    /**
     * 从自定义头像URL中解析头像ID
     * @param url 自定义头像URL（hrvavatar://xxx）
     * @returns 头像ID（非自定义URL返回"-1"）
     */
    public static getAvatarIdFromPicUrl(url: string): string {
        return !FBPictureSetter.isProfileAvatarURL(url) ? "-1" : url.split("hrvavatar://")[1];
    }

    /**
     * 根据头像ID获取本地资源路径
     * @param avatarId 头像ID
     * @returns 本地资源路径（ID为"-1"返回"undefined"）
     */
    public static getResourcesPathFromAvatarId(avatarId: string): string {
        return avatarId === "-1" ? "undefined" : `Img/ProfileAvatar/${avatarId}`;
    }

    /**
     * 根据头像ID生成自定义头像URL
     * @param avatarId 头像ID
     * @returns 自定义头像URL（ID为"-1"返回"undefined"）
     */
    public static getPicUrlFromAvatarId(avatarId: string): string {
        return avatarId === "-1" ? "undefined" : `hrvavatar://${avatarId}`;
    }
}