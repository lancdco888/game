const { ccclass, property } = cc._decorator;

// 导入项目依赖文件 (路径与原项目完全一致，请勿修改，完美兼容)
import SoundManager from "./manager/SoundManager";

/**
 * 音效切片信息实体类 - 解析音频图集的单个音效切片配置(start/end时间)
 * 对应原代码的匿名AudioSprite类，转正命名+补全类型注解
 */
export class AudioSprite {
    public name: string = "";
    public start: number = 0;
    public end: number = 0;
    public loop: boolean = false;

    /** 解析音效切片配置 */
    public parse(name: string, data: { start: number, end: number, loop: boolean }): void {
        this.name = name;
        this.start = data.start;
        this.end = data.end;
        this.loop = data.loop;
    }
}

/**
 * 音效播放信息实体类 - 管理单次/循环音效的播放状态、回调、音频源
 * 对应原代码的匿名播放信息类，转正命名+补全类型注解
 */
export class FxPlayInfo {
    public id: number = 0;
    public clipKey: string = "";
    public source: any = null;
    public endCallback: Function | null = null;
    public loopCallback: Function | null = null;

    constructor(id: number, clipKey: string, source: any, endCallback?: Function) {
        this.id = id;
        this.clipKey = clipKey;
        this.source = source;
        this.endCallback = endCallback || null;
        this.loopCallback = null;
    }
}

/**
 * 音效键值对序列化类 - 编辑器配置音效标识与音频切片名称的映射关系
 * 对应原代码的匿名AudioKeyValue类，转正命名+补全序列化装饰器
 */
@ccclass
export class AudioKeyValue {
    @property()
    public clipKey: string = "";

    @property()
    public fileName: string = "";
}

/**
 * 音频图集音效切片管理器 (核心性能优化组件，GameCommonSound高优先级依赖)
 * 核心功能：将多个短小音效合并为单个音频图集文件，通过【时间切片】播放指定时间段的音效
 * 支持：单次音效切片播放(自动停止)、循环音效切片循环播放(无限重复切片)、播放状态管理、调度器自动管理
 * 底层依赖：调用 SoundManager 完成音频的实际播放，是音效体系的高性能播放源
 */
@ccclass
export default class AudioAtlasSetter extends cc.Component {
    // ===================== 【序列化属性】与原代码完全一致 (编辑器拖拽赋值，属性名无任何修改) =====================
    @property
    public resName: string = "";          // 音频图集资源名称 (对应 soundRes 的key)

    @property({ type: cc.AudioClip })
    public clip: cc.AudioClip = null;        // 音频图集的完整音频剪辑

    @property({ type: [AudioKeyValue] })
    public clipKeys: AudioKeyValue[] = [];// 音效标识与切片名称的映射配置数组

    // ===================== 【私有成员变量】补全精准TS类型注解，原默认值完全保留 =====================
    private clipKeysInfoMap: { [key: string]: { start: number, end: number, loop: boolean } } = {}; // 音效切片配置映射表
    private playingFxOnceInfos: { [key: number]: FxPlayInfo } = {}; // 正在播放的单次音效状态池
    private playingFxOnceId: number = 0;                           // 单次音效自增ID
    private playingFxLoopInfos: { [key: number]: FxPlayInfo } = {}; // 正在播放的循环音效状态池
    private playingFxLoopId: number = 0;                           // 循环音效自增ID

    // ===================== 【静态常量】✅ 核心重中之重 - 完整保留原代码的所有音效切片配置，无任何修改 =====================
    public static soundRes = {
        default_atlas: {
            resources: ["default_atlas.mp3"],
            spritemap: {
                silence: { start: 0, end: 1, loop: true },
                button_casino: { start: 2, end: 2.439546485260771, loop: false },
                button_dailybingoball: { start: 4, end: 4.734648526077097, loop: false },
                button_etc: { start: 6, end: 6.137142857142857, loop: false },
                button_shop: { start: 8, end: 8.264625850340137, loop: false },
                button_slots: { start: 10, end: 10.312018140589569, loop: false },
                congrats: { start: 12, end: 16.36979591836735, loop: false },
                count_coins: { start: 18, end: 19.08798185941043, loop: false },
                count_time: { start: 21, end: 25.071224489795917, loop: false },
                get_bingoball: { start: 27, end: 28.057755102040815, loop: false },
                get_coins: { start: 30, end: 32.78371882086168, loop: false },
                levelup: { start: 34, end: 37.8, loop: false },
                ms_complete: { start: 39, end: 41.849410430839, loop: false },
                ms_completeall: { start: 43, end: 45.55979591836735, loop: false },
                paging: { start: 47, end: 47.244285714285716, loop: false },
                pop_db: { start: 49, end: 49.96691609977324, loop: false },
                pop_etc: { start: 51, end: 51.60390022675737, loop: false },
                pop_noti: { start: 53, end: 53.671768707483, loop: false },
                pop_offer: { start: 55, end: 55.62424036281179, loop: false },
                pop_shop: { start: 57, end: 57.6107029478458, loop: false },
                pop_unlock: { start: 59, end: 59.978526077097506, loop: false },
                pop_unlockbingo: { start: 61, end: 62.85476190476191, loop: false },
                stopcounting: { start: 64, end: 65.5, loop: false },
                unfolding: { start: 67, end: 67.20049886621315, loop: false },
                vipup: { start: 69, end: 72.07272108843537, loop: false },
                welcome: { start: 74, end: 76.98507936507937, loop: false },
                winner_noti: { start: 78, end: 78.70907029478458, loop: false }
            }
        }
    };

    // ===================== 【生命周期回调】原逻辑完全保留 - 初始化解析音效切片配置映射表 =====================
    onLoad(): void {
        const soundData = AudioAtlasSetter.soundRes[this.resName];
        const spriteMapKeys = Object.keys(soundData.spritemap);
        const spriteMap: { [key: string]: { start: number, end: number, loop: boolean } } = {};

        // 解析音频图集的切片配置
        for (let i = 0; i < spriteMapKeys.length; ++i) {
            const key = spriteMapKeys[i];
            const info = soundData.spritemap[key];
            const audioSprite = new AudioSprite();
            audioSprite.parse(key, info);
            spriteMap[key] = info;
        }

        // 映射编辑器配置的音效标识与切片配置
        for (let i = 0; i < this.clipKeys.length; ++i) {
            const keyItem = this.clipKeys[i];
            if (spriteMap[keyItem.fileName]) {
                this.clipKeysInfoMap[keyItem.clipKey] = spriteMap[keyItem.fileName];
            } else {
                cc.error("not found clipKey: ", keyItem.clipKey, "/", keyItem.fileName);
            }
        }
    }

    // ===================== 【原生环境兼容方法】原逻辑完全保留 =====================
    start(): void {
        if (cc.sys.isNative) {
            const audioSource = SoundManager.Instance()?.playFxOnce(this.clip, 0);
            this.scheduleOnce(() => {
                SoundManager.Instance()?.stopFxOnceBySource(audioSource);
            }, 0.3);
        }
    }

    // ===================== 【私有注册/注销方法】单次音效状态管理，原逻辑完全保留 =====================
    private registerFxOnce(clipKey: string, source: any, endCallback?: Function): number {
        ++this.playingFxOnceId;
        const playInfo = new FxPlayInfo(this.playingFxOnceId, clipKey, source, endCallback);
        this.playingFxOnceInfos[playInfo.id] = playInfo;
        return playInfo.id;
    }

    private unregisterFxOnce(id: number): void {
        if (this.playingFxOnceInfos[id]) {
            delete this.playingFxOnceInfos[id];
        }
    }

    // ===================== 【私有注册/注销方法】循环音效状态管理，原逻辑完全保留 =====================
    private registerFxLoop(clipKey: string): number {
        ++this.playingFxLoopId;
        const playInfo = new FxPlayInfo(this.playingFxLoopId, clipKey, null);
        this.playingFxLoopInfos[playInfo.id] = playInfo;
        return playInfo.id;
    }

    private unregisterFxLoop(id: number): void {
        if (this.playingFxLoopInfos[id]) {
            delete this.playingFxLoopInfos[id];
        }
    }

    // ===================== 【私有辅助方法】循环音效状态更新，原逻辑完全保留 =====================
    private setSourceFxLoop(id: number, source: any): void {
        if (this.playingFxLoopInfos[id]) {
            this.playingFxLoopInfos[id].source = source;
        } else {
            cc.error(`setSourceFxLoop not found id: ${id.toString()}`);
        }
    }

    private setLoopCallbackFxLoop(id: number, callback: Function): void {
        if (this.playingFxLoopInfos[id]) {
            this.playingFxLoopInfos[id].loopCallback = callback;
        } else {
            cc.error(`setSourceFxLoop not found id: ${id.toString()}`);
        }
    }

    // ===================== 【核心公共方法】播放单次切片音效 - 原逻辑完全保留 ✅ =====================
    /**
     * 播放音频图集的单次切片音效 (播放指定时间段后自动停止，自动注销状态)
     * @param clipKey 音效标识
     * @param endCallback 播放完成后的回调(可选)
     * @returns 播放ID / -1(播放失败)
     */
    public playFxOnce(clipKey: string, endCallback?: Function): number {
        const clipInfo = this.clipKeysInfoMap[clipKey];
        if (!clipInfo) {
            cc.error("play not found clipKey: ", clipKey);
            endCallback && endCallback();
            return -1;
        }

        const soundManager = SoundManager.Instance();
        if (!soundManager) {
            cc.error("SoundManager.Instance not found: ", clipKey);
            endCallback && endCallback();
            return -1;
        }

        cc.log(`AudioAtlas playFxOnce ${clipKey}`);
        const playDuration = clipInfo.end - clipInfo.start + 0.02; // 保留原代码0.02秒时间补偿
        const audioSource = soundManager.playFxOnce(this.clip, clipInfo.start);

        if (!audioSource) {
            endCallback && endCallback();
            return -1;
        }

        const playId = this.registerFxOnce(clipKey, audioSource, endCallback);
        const stopFunc = this.stopFxOnceByID.bind(this, playId);
        this.scheduleOnce(stopFunc, playDuration);
        return playId;
    }

    // ===================== 【公共方法】停止指定单次音效 - 原逻辑完全保留 =====================
    public stopFxOnce(clipKey: string): void {
        const playIds = Object.keys(this.playingFxOnceInfos);
        for (let i = 0; i < playIds.length; ++i) {
            const playInfo = this.playingFxOnceInfos[+playIds[i]];
            if (playInfo.clipKey === clipKey) {
                this.stopFxOnceByID(playInfo.id);
            }
        }
    }

    public stopFxOnceByID(id: number): void {
        if (this.playingFxOnceInfos[id]) {
            const playInfo = this.playingFxOnceInfos[id];
            SoundManager.Instance()?.stopFxOnceBySource(playInfo.source);
            
            if (playInfo.endCallback) {
                playInfo.endCallback();
                playInfo.endCallback = null;
            }
            this.unregisterFxOnce(id);
        }
    }

    public isPlayingFxOnceByID(id: number): boolean {
        return !!this.playingFxOnceInfos[id];
    }

    // ===================== 【核心公共方法】播放循环切片音效 - 原逻辑完全保留 ✅ =====================
    /**
     * 播放音频图集的循环切片音效 (无限重复播放指定切片，通过调度器实现循环)
     * @param clipKey 音效标识
     * @returns 播放ID / -1(播放失败)
     */
    public playFxLoop(clipKey: string): number {
        const self = this;
        const clipInfo = this.clipKeysInfoMap[clipKey];
        if (!clipInfo) {
            cc.error("play not found clipKey: ", clipKey);
            return -1;
        }

        const soundManager = SoundManager.Instance();
        if (!soundManager) {
            cc.error("SoundManager.Instance not found: ", clipKey);
            return -1;
        }

        const playId = this.registerFxLoop(clipKey);
        let audioSource = soundManager.playFxOnce(this.clip, clipInfo.start);

        if (!audioSource) {
            if (soundManager.getFxVolume() > 0) {
                cc.error("play not found valid source: ", clipKey);
            }
            return -1;
        }

        this.setSourceFxLoop(playId, audioSource);
        const playDuration = clipInfo.end - clipInfo.start + 0.02; // 保留原代码0.02秒时间补偿

        // 循环播放回调：停止当前切片 → 重新播放 → 更新音频源
        const loopCallback = function () {
            soundManager.stopFxOnceBySource(audioSource);
            audioSource = soundManager.playFxOnce(self.clip, clipInfo.start);
            
            if (!audioSource) {
                cc.error("play not found valid source: ", clipKey);
                self.stopFxLoopByID(playId);
                return;
            }
            self.setSourceFxLoop(playId, audioSource);
        };

        this.setLoopCallbackFxLoop(playId, loopCallback);
        this.schedule(loopCallback, playDuration);
        return playId;
    }

    // ===================== 【公共方法】停止指定循环音效 - 原逻辑完全保留 =====================
    public stopFxLoop(clipKey: string): void {
        const playIds = Object.keys(this.playingFxLoopInfos);
        for (let i = 0; i < playIds.length; ++i) {
            const playInfo = this.playingFxLoopInfos[+playIds[i]];
            if (playInfo.clipKey === clipKey) {
                this.stopFxLoopByID(playInfo.id);
            }
        }
    }

    public stopFxLoopByID(id: number): void {
        if (this.playingFxLoopInfos[id]) {
            const playInfo = this.playingFxLoopInfos[id];
            SoundManager.Instance()?.stopFxOnceBySource(playInfo.source);
            
            if (playInfo.loopCallback) {
                this.unschedule(playInfo.loopCallback);
                playInfo.loopCallback = null;
            }
            this.unregisterFxLoop(id);
        }
    }

    public isPlayingFxLoopByID(id: number): boolean {
        return !!this.playingFxLoopInfos[id];
    }
}