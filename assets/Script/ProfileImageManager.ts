const { ccclass, property } = cc._decorator;

import FBPictureSetter, { FB_PICTURE_TYPE } from "./FBPictureSetter";

// 兼容原代码的Utility工具类
declare const Utility: {
    isFacebookInstant: () => boolean;
};

/**
 * 头像资源管理类（ProfileImageManager）
 * 负责头像缓存、FB头像/本地自定义头像加载，限制缓存大小并自动清理
 */
@ccclass("ProfileImageManager")
export default class ProfileImageManager {
    // ================= 静态缓存配置 =================
    private static _cache: Map<string, cc.SpriteFrame> = new Map(); // 头像缓存（key: 缓存键, value: 精灵帧）
    public static readonly MAX_CACHE_SIZE: number = 100; // 最大缓存数量

    // ================= 核心加载方法 =================
    /**
     * 加载头像（优先查缓存，未命中则加载远程/本地资源）
     * @param url 头像URL（FB地址/自定义hrvavatar协议）
     * @param type FB头像尺寸类型（SMALL/NORMAL/LARGE/SQUARE）
     * @param callback 回调函数（参数：SpriteFrame | null）
     */
    public static loadProfileImage(
        url: string | null | undefined,
        type: FB_PICTURE_TYPE,
        callback: (spriteFrame: cc.SpriteFrame | null) => void
    ): void {
        // URL为空/空字符串：直接返回null
        if (!url || url.length === 0) {
            callback && callback(null);
            return;
        }

        // 生成缓存键
        const cacheKey = this.generateCacheKey(url, type);

        // 缓存命中：直接返回缓存的SpriteFrame
        if (this._cache.has(cacheKey)) {
            cc.log(`ProfileImageManager: Cache hit for ${cacheKey}`);
            callback && callback(this._cache.get(cacheKey)!);
            return;
        }

        // 缓存未命中：加载资源
        cc.log(`ProfileImageManager: Cache miss, loading ${cacheKey}`);
        if (FBPictureSetter.isProfileAvatarURL(url)) {
            // 自定义头像：加载本地资源
            this.loadLocalAvatar(url, cacheKey, callback);
        } else {
            // FB头像：加载远程资源
            this.loadFacebookImage(url, type, cacheKey, callback);
        }
    }

    // ================= 缓存键生成 =================
    /**
     * 生成缓存键（本地头像用URL，FB头像用URL+尺寸类型）
     * @param url 头像URL
     * @param type FB头像尺寸类型
     * @returns 缓存键
     */
    public static generateCacheKey(url: string, type: FB_PICTURE_TYPE): string {
        return FBPictureSetter.isProfileAvatarURL(url) ? url : `${url}_${type}`;
    }

    // ================= FB头像加载 =================
    /**
     * 加载FB远程头像
     * @param url FB头像基础URL
     * @param type FB头像尺寸类型
     * @param cacheKey 缓存键
     * @param callback 回调函数
     */
    private static loadFacebookImage(
        url: string,
        type: FB_PICTURE_TYPE,
        cacheKey: string,
        callback: (spriteFrame: cc.SpriteFrame | null) => void
    ): void {
        let loadUrl = url;

        // 非FB小游戏环境 + FB头像URL：拼接access_token和尺寸参数
        if (!Utility.isFacebookInstant() && url.indexOf("https://graph.facebook.com") !== -1) {
            loadUrl = `${url}?type=${type}&access_token=${"FacebookUtil.m_fbAccessToken"}`;
        }

        // 加载远程图片
        cc.loader.load({ url: loadUrl, type: "png" }, (err, texture) => {
            // 加载失败：返回null
            if (err) {
                cc.log(`ProfileImageManager: Failed to load Facebook image ${JSON.stringify(err)}`);
                callback && callback(null);
                return;
            }

            // 加载成功：创建SpriteFrame并缓存
            if (texture instanceof cc.Texture2D) {
                const spriteFrame = new cc.SpriteFrame(texture);
                this.addToCache(cacheKey, spriteFrame);
                callback && callback(spriteFrame);
            } else {
                // 非Texture2D类型：返回null
                callback && callback(null);
            }
        });
    }

    // ================= 本地自定义头像加载 =================
    /**
     * 加载本地自定义头像（hrvavatar协议）
     * @param url 自定义头像URL（hrvavatar://xxx）
     * @param cacheKey 缓存键
     * @param callback 回调函数
     */
    private static loadLocalAvatar(
        url: string,
        cacheKey: string,
        callback: (spriteFrame: cc.SpriteFrame | null) => void
    ): void {
        // 解析头像ID + 获取本地资源路径
        const avatarId = FBPictureSetter.getAvatarIdFromPicUrl(url);
        const resPath = FBPictureSetter.getResourcesPathFromAvatarId(avatarId);

        cc.log(`ProfileImageManager: Loading local avatar ${resPath}`);

        // 加载本地资源
        cc.loader.loadRes(resPath, (err, texture) => {
            // 加载失败：返回null
            if (err) {
                cc.log(`ProfileImageManager: Failed to load local avatar ${JSON.stringify(err)}`);
                callback && callback(null);
                return;
            }

            // 加载成功：创建SpriteFrame并缓存
            const spriteFrame = new cc.SpriteFrame(texture as cc.Texture2D);
            this.addToCache(cacheKey, spriteFrame);
            callback && callback(spriteFrame);
        });
    }

    // ================= 缓存管理 =================
    /**
     * 添加到缓存（添加前检查并清理超出大小的缓存）
     * @param key 缓存键
     * @param spriteFrame 要缓存的精灵帧
     */
    public static addToCache(key: string, spriteFrame: cc.SpriteFrame): void {
        // 清理超出大小的缓存
        this.manageCacheSize();
        // 添加到缓存
        this._cache.set(key, spriteFrame);
        cc.log(`ProfileImageManager: Cached ${key} (Total: ${this._cache.size})`);
    }

    /**
     * 管理缓存大小（超出最大限制时清理20%旧数据）
     */
    public static manageCacheSize(): void {
        // 未超出最大缓存：无需清理
        if (this._cache.size < this.MAX_CACHE_SIZE) {
            return;
        }

        // 计算要清理的数量（20%的最大缓存数，向上取整）
        const removeCount = Math.ceil(0.2 * this.MAX_CACHE_SIZE);
        // 获取缓存键列表并删除前N个（最旧的缓存）
        const keysToRemove = Array.from(this._cache.keys()).slice(0, removeCount);
        
        keysToRemove.forEach((key) => {
            this._cache.delete(key);
            cc.log(`ProfileImageManager: Removed from cache ${key}`);
        });

        cc.log(`ProfileImageManager: Cache cleanup completed. Size: ${this._cache.size}`);
    }

    // ================= 缓存查询/清理 =================
    /**
     * 获取缓存的头像
     * @param url 头像URL
     * @param type FB头像尺寸类型
     * @returns 缓存的SpriteFrame（无则返回null）
     */
    public static getCachedImage(url: string, type: FB_PICTURE_TYPE): cc.SpriteFrame | null {
        const cacheKey = this.generateCacheKey(url, type);
        return this._cache.get(cacheKey) || null;
    }

    /**
     * 清空所有缓存
     */
    public static clearCache(): void {
        this._cache.clear();
        cc.log("ProfileImageManager: Cache cleared");
    }

    /**
     * 获取当前缓存大小
     * @returns 缓存数量
     */
    public static getCacheSize(): number {
        return this._cache.size;
    }

    /**
     * 获取缓存信息（大小、最大限制、所有缓存键）
     * @returns 缓存信息对象
     */
    public static getCacheInfo(): {
        size: number;
        maxSize: number;
        keys: string[];
    } {
        return {
            size: this._cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            keys: Array.from(this._cache.keys())
        };
    }
}