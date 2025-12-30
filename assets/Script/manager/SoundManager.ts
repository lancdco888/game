import LocalStorageManager from "./LocalStorageManager";

const { ccclass, property } = cc._decorator;

// 导入项目依赖文件 (路径与原项目完全一致，请勿修改，完美兼容)
//import LocalStorageManager from "../../../global_utility/LocalStorage/LocalStorageManager";

/**
 * 全局音效/背景音乐管理器 - 单例模式 (核心音频组件)
 * 核心功能：统一管理BGM播放/暂停、单次音效(按钮/特效)轮询播放、循环音效播放/停止、全局音量/静音控制
 * 读取本地存储的音效配置，自动管理音频源池，防止内存泄漏，原生/浏览器环境兼容处理
 * 项目中所有音效调用均通过该管理器，是音频体系的唯一入口
 */
@ccclass('SoundManager')
export default class SoundManager extends cc.Component {
    // ===================== 【单例核心配置】与原代码完全一致 (调用方式不变，不可修改) =====================
    private static _instance: SoundManager = null;

    /**
     * 获取单例实例 - 项目中唯一调用方式，与原代码一致
     * @returns SoundManager实例 / null(未初始化时返回null并打印日志)
     */
    public static Instance(): SoundManager {
        if (this._instance) {
            return this._instance;
        }
        cc.log("not init soundManager");
        return null;
    }

    // ===================== 【私有成员变量】补全精准TS类型注解，原默认值完全保留 =====================
    private _mainBgmSource: cc.AudioSource = null;          // 背景音乐唯一音频源
    private _fxLoopSources: Array<cc.AudioSource> = [];     // 循环音效音频源池 (可自动扩容)
    private _fxOnceSources: Array<cc.AudioSource> = [];     // 单次音效音频源池 (固定15个，轮询使用)
    private _fxLoopCurIdx: number = 0;                   // 循环音效源索引
    private _fxOnceCurIdx: number = 0;                   // 单次音效源索引
    private _fxLoopCapacity: number = 5;                 // 循环音效源初始容量
    private _mainBgmVolume: number = 0.7;                // BGM默认音量
    private _fxVolume: number = 0.7;                     // 音效默认音量
    private _mainBgmMute: boolean = false;               // BGM静音状态
    private _fxMute: boolean = false;                    // 音效静音状态

    // ===================== 【生命周期回调】原逻辑完全保留，单例唯一实例防护 =====================
    onLoad(): void {
        // 单例防护：已存在实例则销毁当前节点，防止多实例创建
        if (SoundManager._instance) {
            this.node.destroy();
            return;
        }
        // 初始化单例+音效管理器核心配置
        SoundManager._instance = this;
        this.initSoundManager();
    }

    onDestroy(): void {
        // 销毁时重置单例，防止内存泄漏
        if (SoundManager._instance === this) {
            SoundManager._instance = null;
        } else {
            cc.error("SoundManager onDestroy error");
        }
    }

    // ===================== 【核心初始化】原逻辑完全保留，创建音频源池+读取本地配置 =====================
    private initSoundManager(): void {
        // 读取本地存储的音效配置（开关+音量）
        const sysInfo = LocalStorageManager.getLocalSystemInfo();
        cc.log("initSoundManager");

        // 创建背景音乐音频源
        this._mainBgmSource = this.addComponent(cc.AudioSource);
        this._fxLoopCapacity = 5;

        // 初始化【循环音效】音频源池 - 初始5个，全部设置为循环播放
        for (let i = 0; i < this._fxLoopCapacity; ++i) {
            const audioSource = this.addComponent(cc.AudioSource);
            audioSource.loop = true;
            this._fxLoopSources.push(audioSource);
        }

        // 初始化【单次音效】音频源池 - 固定15个，清空clip防止内存泄漏
        for (let i = 0; i < 15; ++i) {
            const audioSource = this.addComponent(cc.AudioSource);
            SoundManager.setAudioSourceClipNull(audioSource);
            this._fxOnceSources.push(audioSource);
        }

        // // 加载本地配置：设置静音+音量
        // this.setMainBGMMute(!sysInfo.mainBgmOnOff);
        // if (sysInfo.mainBgmOnOff) this.setMainVolume(sysInfo.mainBgmVolume);
        
        // this.setFxMute(!sysInfo.effectSoundOnOff);
        // if (sysInfo.effectSoundOnOff) this.setFxVolume(sysInfo.effectSoundVolume);
    }

    // ===================== 【背景音乐(BGM) 音量/静音 控制】原逻辑完全保留 =====================
    /** 设置背景音乐静音状态 */
    public setMainBGMMute(isMute: boolean): void {
        this._mainBgmMute = isMute;
        this._mainBgmSource.mute = isMute;
    }

    /** 临时设置BGM音量（叠加倍率，不修改原始音量） */
    public setMainVolumeTemporarily(ratio: number): void {
        this._mainBgmSource.volume = this._mainBgmVolume * ratio;
    }

    /** 重置BGM音量为原始值（取消临时倍率） */
    public resetTemporarilyMainVolume(): void {
        this._mainBgmSource.volume = this._mainBgmVolume;
    }

    /** 设置背景音乐音量（永久修改原始音量） */
    public setMainVolume(volume: number): void {
        this._mainBgmVolume = volume;
        this._mainBgmSource.volume = volume;
    }

    /** 获取背景音乐当前音量 */
    public getMainVolume(): number {
        return this._mainBgmVolume;
    }

    /** 获取当前播放的BGM音频剪辑 */
    public getMainBGMClip(): cc.AudioSource['clip'] {
        return this._mainBgmSource.clip;
    }

    // ===================== 【音效(FX) 音量/静音 控制】原逻辑完全保留 =====================
    /** 设置音效音量（永久修改，同步所有音效源） */
    public setFxVolume(volume: number): void {
        this._fxVolume = volume;
        // 同步循环音效源音量
        for (let i = 0; i < this._fxLoopSources.length; ++i) {
            this._fxLoopSources[i].volume = volume;
        }
        // 同步单次音效源音量
        for (let i = 0; i < this._fxOnceSources.length; ++i) {
            this._fxOnceSources[i].volume = volume;
        }
    }

    /** 设置音效静音状态（同步所有音效源） */
    public setFxMute(isMute: boolean): void {
        this._fxMute = isMute;
        // 同步循环音效源静音
        for (let i = 0; i < this._fxLoopSources.length; ++i) {
            this._fxLoopSources[i].mute = isMute;
        }
        // 同步单次音效源静音
        for (let i = 0; i < this._fxOnceSources.length; ++i) {
            this._fxOnceSources[i].mute = isMute;
        }
    }

    /** 获取音效当前音量 */
    public getFxVolume(): number {
        return this._fxVolume;
    }

    // ===================== 【背景音乐(BGM) 播放/暂停 核心方法】原逻辑完全保留 =====================
    /**
     * 播放背景音乐
     * @param clip BGM音频剪辑
     * @param volume 自定义音量(可选)
     */
    public playBGM(clip: cc.AudioSource['clip'], volume?: number): void {
        if (!clip) return;
        this._mainBgmSource.clip = clip;
        this._mainBgmSource.loop = true;
        this.stopBGM();
        this._mainBgmSource.mute = this._mainBgmMute;
        
        if (volume !== undefined && volume !== null) {
            this.setMainVolume(volume);
        } else {
            this._mainBgmSource.volume = this._mainBgmVolume;
        }
        this._mainBgmSource.play();
    }

    /** 停止播放背景音乐 */
    public stopBGM(): void {
        if (this._mainBgmSource.clip && this._mainBgmSource.clip.toString() !== "") {
            this._mainBgmSource.stop();
        }
    }

    // ===================== 【单次音效 核心播放逻辑】原逻辑完全保留，轮询复用音频源，防内存泄漏 =====================
    /** 轮询获取空闲的单次音效音频源 - 核心优化，避免创建过多音频源 */
    private getNextFxOnce(): cc.AudioSource | null {
        for (let i = 0; i < this._fxOnceSources.length; ++i) {
            const idx = (this._fxOnceCurIdx + i) % this._fxOnceSources.length;
            const audioSource = this._fxOnceSources[idx];
            
            // 原生环境/浏览器环境 双判断空闲状态
            if (audioSource.clip) {
                if (cc.sys.isNative) {
                    if (audioSource.getDuration() !== -1) continue;
                } else {
                    if (audioSource.isPlaying) continue;
                }
            }
            // 更新索引，下次从下一个开始轮询
            this._fxOnceCurIdx = (idx + 1) % this._fxOnceSources.length;
            return audioSource;
        }
        return null;
    }

    /**
     * 播放单次音效（按钮/特效音，播放一次自动停止，轮询复用音频源）
     * @param clip 音效音频剪辑
     * @param startTime 播放起始时间(可选)
     * @param volume 自定义音量(可选)
     * @returns 正在播放的音频源/null
     */
    public playFxOnce(clip:cc.AudioSource['clip'], startTime?: number, volume?: number): cc.AudioSource | null {
        if (this._fxVolume === 0 || !clip) return null;
        const audioSource = this.getNextFxOnce();
        if (!audioSource) return null;

        audioSource.clip = clip;
        audioSource.mute = this._fxMute;
        audioSource.volume = (volume !== undefined && volume !== null) ? volume : this._fxVolume;

        if (startTime !== undefined && startTime !== null && startTime !== 0) {
            audioSource.play();
            audioSource.setCurrentTime(startTime);
        } else {
            audioSource.play();
        }
        return audioSource;
    }

    // ===================== 【循环音效 核心播放逻辑】原逻辑完全保留，自动扩容，最大20个限制 =====================
    /**
     * 播放循环音效（持续播放的特效音，如背景音乐之外的循环音效）
     * @param clip 音效音频剪辑
     * @param volume 自定义音量(可选)
     */
    public playFxLoop(clip: cc.AudioSource['clip'], volume?: number): void {
        if (this._fxVolume === 0 || !clip) return;
        
        let audioSource: cc.AudioSource | null = null;
        // 查找空闲的循环音效源
        for (let i = 0; i < this._fxLoopCapacity; ++i) {
            audioSource = this._fxLoopSources[i];
            if (!audioSource.clip) {
                audioSource.clip = clip;
                audioSource.loop = true;
                break;
            }
            // 无空闲源，自动扩容 (最大20个，防止内存溢出)
            if (i === this._fxLoopCapacity - 1) {
                if (this._fxLoopCapacity >= 20) {
                    cc.log("error : Too many fxLoop sources ( Max : 20 )");
                    return;
                }
                const newAudio = this.node.addComponent(cc.AudioSource);
                this._fxLoopSources.push(newAudio);
                this._fxLoopCapacity++;
                audioSource = newAudio;
                audioSource.clip = clip;
                audioSource.loop = true;
                break;
            }
        }

        // 设置音量+静音+播放
        if (audioSource) {
            audioSource.volume = (volume !== undefined && volume !== null) ? volume : this._fxVolume;
            audioSource.mute = this._fxMute;
            audioSource.play();
        }
    }

    // ===================== 【音效停止/状态判断】所有方法原逻辑完全保留 =====================
    /** 根据音频剪辑停止对应的单次音效 */
    public stopFxOnce(clip: cc.AudioSource['clip']): void {
        for (let i = 0; i < this._fxOnceSources.length; ++i) {
            const audioSource = this._fxOnceSources[i];
            if (audioSource.clip === clip) {
                audioSource.stop();
                SoundManager.setAudioSourceClipNull(audioSource);
                break;
            }
        }
    }

    /** 根据音频源实例停止单次音效 */
    public stopFxOnceBySource(audioSource: cc.AudioSource): void {
        for (let i = 0; i < this._fxOnceSources.length; ++i) {
            const source = this._fxOnceSources[i];
            if (source === audioSource) {
                source.stop();
                SoundManager.setAudioSourceClipNull(source);
                break;
            }
        }
    }

    /** 判断指定单次音效是否正在播放 */
    public isPlayingFxOnce(clip: cc.AudioSource['clip']): boolean {
        let isPlaying = false;
        for (let i = 0; i < this._fxOnceSources.length; ++i) {
            const audioSource = this._fxOnceSources[i];
            if (audioSource.clip === clip && (
                (!cc.sys.isNative && audioSource.isPlaying) || 
                (cc.sys.isNative && audioSource.getDuration() !== -1)
            )) {
                isPlaying = true;
                break;
            }
        }
        return isPlaying;
    }

    /** 判断指定循环音效是否正在播放 */
    public isPlayingFxLoop(clip: cc.AudioSource['clip']): boolean {
        for (let i = 0; i < this._fxLoopSources.length; ++i) {
            if (this._fxLoopSources[i].clip === clip) {
                return true;
            }
        }
        return false;
    }

    /** 根据音频剪辑停止对应的循环音效 */
    public stopFxLoop(clip: cc.AudioSource['clip']): void {
        if (!clip) return;
        for (let i = 0; i < this._fxLoopSources.length; ++i) {
            const audioSource = this._fxLoopSources[i];
            if (audioSource.clip === clip) {
                audioSource.stop();
                SoundManager.setAudioSourceClipNull(audioSource);
                break;
            }
        }
    }

    /** 停止所有正在播放的循环音效 */
    public stopAllFxLoop(): void {
        for (let i = 0; i < this._fxLoopSources.length; ++i) {
            const audioSource = this._fxLoopSources[i];
            if (audioSource.clip) {
                audioSource.stop();
                SoundManager.setAudioSourceClipNull(audioSource);
            }
        }
    }

    // ===================== 【全局静态快捷调用方法】与原代码完全一致，简化外部调用 =====================
    /** 静态快捷播放单次音效 */
    public static staticPlayFxOnce(clip: cc.AudioSource['clip'], startTime?: number, volume?: number): cc.AudioSource | null {
        const instance = SoundManager.Instance();
        return instance ? instance.playFxOnce(clip, startTime, volume) : null;
    }

    /** 静态快捷播放循环音效 */
    public static staticPlayFxLoop(clip:cc.AudioSource['clip'], volume?: number): void {
        const instance = SoundManager.Instance();
        instance && instance.playFxLoop(clip, volume);
    }

    /** 静态快捷停止循环音效 */
    public static staticStopFxLoop(clip: cc.AudioSource['clip']): void {
        const instance = SoundManager.Instance();
        instance && instance.stopFxLoop(clip);
    }

    // ===================== 【静态工具方法】核心内存泄漏防护，原逻辑完全保留 =====================
    /**
     * 清空音频源的clip引用 - 关键！防止Cocos 2.x AudioSource内存泄漏
     * 私有属性赋值 _clip = null 是2.x原生解决方案，必须保留
     */
    public static setAudioSourceClipNull(audioSource: cc.AudioSource): void {
        if (!audioSource) {
            cc.error("setAudioSourceClipNull source is null");
            return;
        }
        audioSource['_clip'] = null;
    }
}