const { ccclass, property } = cc._decorator;

// 导入项目所有依赖文件 (路径与原项目完全一致，请勿修改，完美兼容所有依赖)
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import AudioAtlasSetter from "./AudioAtlasSetter";
import SoundManager from "./manager/SoundManager";

/**
 * 全局公共音效顶层封装类 - 单例模式 (音效体系门面类，项目唯一音效调用入口)
 * 核心定位：所有业务逻辑统一调用该类的静态方法播放/停止音效，内部自动适配双音效源
 * 优先级规则：AudioAtlasSetter(音效图集) > CommonSoundSetter(普通音效)，优先使用图集加载的音效，性能更优
 * 底层依赖：最终调用 SoundManager 完成音频的实际播放，是音效调用的统一封装层
 */
@ccclass('GameCommonSound')
export default class GameCommonSound extends cc.Component {
    // ===================== 【序列化属性】与原代码完全一致 (编辑器拖拽赋值，属性名无任何修改) =====================
    @property(CommonSoundSetter)
    public soundSetter: CommonSoundSetter = null;  // 普通音效配置器 - 单音频文件配置源

    @property(AudioAtlasSetter)
    public atlasSetter: AudioAtlasSetter = null;  // 音效图集配置器 - 音频图集配置源【优先级更高】

    // ===================== 【单例核心配置】与原代码完全一致 (静态私有实例，全局唯一) =====================
    private static _instance: GameCommonSound = null;

    // ===================== 【静态初始化方法】原逻辑完全保留 - 全局初始化音效模块，项目启动时调用 =====================
    /**
     * 全局初始化游戏公共音效模块 (项目启动时调用一次即可)
     * @param resPath 音效预制体资源路径 (可选，默认值: Sound/GameCommonSound)
     */
    public static initGameCommonSound(resPath?: string): void {
        let loadPath = "Sound/GameCommonSound";
        // 传入自定义路径则覆盖默认路径
        if (typeof resPath === "string") {
            loadPath = resPath;
        }
        // 加载音效预制体并初始化单例
        cc.loader.loadRes(loadPath, (err, prefab) => {
            if (err) {
                cc.error("initGameCommSound fail " + err.message); // 保留原代码的日志拼写细节(少o)
                return;
            }
            // 实例化预制体 + 获取组件实例 + 设置为常驻节点(全局不销毁)
            const instNode = cc.instantiate(prefab);
            GameCommonSound._instance = instNode.getComponent(GameCommonSound);
            cc.game.addPersistRootNode(instNode);
        });
    }

    // ===================== 【实例私有方法】原逻辑完全保留 - 内部获取音频剪辑 =====================
    /**
     * 实例方法：从普通音效配置器中获取指定名称的音频剪辑
     * @param soundName 音效名称标识
     * @returns 音频剪辑 / null
     */
    private getAudioClip(soundName: string): any {
        return this.soundSetter ? this.soundSetter.getAudioClip(soundName) : null;
    }

    // ===================== 【静态工具方法】原逻辑完全保留 - 全局获取音频剪辑 =====================
    /**
     * 静态方法：全局获取指定名称的音频剪辑
     * @param soundName 音效名称标识
     * @returns 音频剪辑 / null
     */
    public static getClip(soundName: string): any {
        if (GameCommonSound._instance && GameCommonSound._instance.soundSetter) {
            return GameCommonSound._instance.soundSetter.getAudioClip(soundName);
        }
        return null;
    }

    // ===================== 【核心静态音效方法】所有业务逻辑调用的顶层入口，优先级规则+逻辑完全保留 ✅ =====================
    /**
     * 【全局调用】播放单次音效 (按钮/弹窗/短特效音，播放一次自动停止)
     * ✅ 优先级核心：有音频图集则优先使用AtlasSetter播放 → 否则使用普通SoundSetter+SoundManager播放
     * @param soundName 音效名称标识 (如：btn_etc 弹窗关闭按钮音效)
     */
    public static playFxOnce(soundName: string): void {
        if (!GameCommonSound._instance) return;
        const instance = GameCommonSound._instance;
        
        if (instance.atlasSetter) {
            // 优先级1：使用音效图集播放 (性能更优，批量加载)
            instance.atlasSetter.playFxOnce(soundName);
        } else if (instance.soundSetter) {
            // 优先级2：使用普通音效配置器 + 底层SoundManager播放
            SoundManager.staticPlayFxOnce(this.getClip(soundName), 0, 1);
        } else {
            // 无有效音效源，打印错误日志
            cc.error("not found valid sound", soundName);
        }
    }

    /**
     * 【全局调用】播放循环音效 (长特效音，持续播放)
     * ✅ 优先级核心：有音频图集则优先使用AtlasSetter播放 → 否则使用普通SoundSetter+SoundManager播放
     * @param soundName 音效名称标识
     */
    public static playFxLoop(soundName: string): void {
        if (!GameCommonSound._instance) return;
        const instance = GameCommonSound._instance;
        
        if (instance.atlasSetter) {
            instance.atlasSetter.playFxLoop(soundName);
        } else if (instance.soundSetter) {
            SoundManager.staticPlayFxLoop(this.getClip(soundName));
        } else {
            cc.error("not found valid sound", soundName);
        }
    }

    /**
     * 【全局调用】停止指定的循环音效
     * ✅ 优先级核心：有音频图集则优先使用AtlasSetter停止 → 否则使用普通SoundSetter+SoundManager停止
     * @param soundName 音效名称标识
     */
    public static stopFxLoop(soundName: string): void {
        if (!GameCommonSound._instance) return;
        const instance = GameCommonSound._instance;
        
        if (instance.atlasSetter) {
            instance.atlasSetter.stopFxLoop(soundName);
        } else if (instance.soundSetter) {
            SoundManager.staticStopFxLoop(this.getClip(soundName));
        }
    }
}