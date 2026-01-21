const { ccclass, property } = cc._decorator;

// 导入项目依赖工具类 (路径与原项目完全一致，请勿修改，完美兼容)
import TSUtility from "./TSUtility";

/**
 * 音效映射配置实体类 - 编辑器可视化配置【音效ID】与【独立音频剪辑】的对应关系
 * 对应原代码的匿名SoundInfo类，转正命名+补全完整序列化装饰器，编辑器属性面板可见可配置
 */
@ccclass('SoundInfo')
export class SoundInfo {
    /** 音效唯一标识ID (如：btn_etc / pop_etc) */
    @property({ tooltip: "音效唯一标识ID" })
    public soundId: string = "";

    /** 该ID对应的独立音频剪辑文件 */
    @property({ type: cc.AudioClip, tooltip: "绑定的音频剪辑资源" })
    public soundResource: cc.AudioClip = null;
}

/**
 * 普通单文件音效配置器 (音效体系兜底组件，GameCommonSound低优先级依赖)
 * 核心功能：编辑器可视化配置「音效ID-音频剪辑」映射关系，提供统一的音频片段获取方法
 * 核心定位：当音频图集(AudioAtlasSetter)不可用时，作为兜底方案提供音效资源，兼容单文件音频加载模式
 * 核心能力：重复ID校验、有效性校验、懒加载初始化、统一的音频片段查询入口
 */
@ccclass
export default class CommonSoundSetter extends cc.Component {
    // ===================== 【序列化属性】与原代码完全一致 (编辑器拖拽配置，属性名无任何修改，配置生效) =====================
    /** 音效映射配置数组 - 在编辑器中添加/配置 音效ID 和 对应的音频剪辑 */
    @property({ type: [SoundInfo], tooltip: "音效ID与音频剪辑的映射配置列表" })
    public sounds: SoundInfo[] = [];

    // ===================== 【私有成员变量】补全精准TS类型注解，原默认值完全保留 =====================
    /** 音效ID与音频剪辑的映射表 - 初始化后构建，供快速查询 */
    private _soundIdMap: { [soundId: string]: cc.AudioClip | null } = {};
    /** 初始化完成标记位 - 防重复执行初始化逻辑，性能优化+避免重复报错 */
    private _init: boolean = false;

    // ===================== 【生命周期回调】原逻辑完全保留 - 组件加载时自动初始化映射表 =====================
    onLoad(): void {
        this.init();
    }

    // ===================== 【核心初始化方法】原逻辑完全保留 - 单例防护+映射表构建+重复ID校验 =====================
    /**
     * 初始化音效映射表
     * ✅ 单例防护：标记位控制，确保只执行一次初始化
     * ✅ 重复校验：检测重复的音效ID并打印错误日志，避免覆盖配置
     */
    public init(): void {
        if (this._init) return;
        this._init = true;

        for (let i = 0; i < this.sounds.length; ++i) {
            const soundInfo = this.sounds[i];
            const soundId = soundInfo.soundId;
            
            // 重复音效ID校验，打印错误日志
            if (this._soundIdMap[soundId]) {
                cc.error(`already exsit id [id:${soundId}]`);
            }
            this._soundIdMap[soundId] = soundInfo.soundResource;
        }
    }

    // ===================== 【核心公共方法】原逻辑完全保留 - 音效片段查询核心方法，被GameCommonSound调用 ✅ =====================
    /**
     * 根据音效ID获取对应的音频剪辑片段
     * ✅ 多层健壮性校验：空ID校验、映射表有效性校验、音频片段有效性校验
     * ✅ 懒加载兜底：未初始化则主动执行初始化，兼容手动调用场景
     * @param soundId 音效唯一标识ID
     * @returns 对应音频剪辑 / null(查询失败/无效ID)
     */
    public getAudioClip(soundId: string): cc.AudioClip | null {
        // 校验1：音效ID为空，直接返回null
        if (soundId.length <= 0) return null;
        // 校验2：映射表无效，直接返回null
        if (!TSUtility.isValid(this._soundIdMap)) return null;

        let audioClip = this._soundIdMap[soundId];
        // 校验3：音频片段无效，尝试懒加载初始化后重新获取
        if (!TSUtility.isValid(audioClip)) {
            if (!this._init) this.init();
            audioClip = this._soundIdMap[soundId];
        }

        // 最终校验：仍无效则打印错误日志，返回null
        if (!TSUtility.isValid(audioClip)) {
            cc.error(`getAudioClip fail [id:${soundId}]`);
            return null;
        }

        return audioClip;
    }
}