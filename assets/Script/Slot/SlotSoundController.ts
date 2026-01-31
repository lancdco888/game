import SoundManager from "../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/** 音效信息实体类 - 原JS内联构造函数 SlotSoundInfo 转换 */
@ccclass()
export class SlotSoundInfo {
    @property({ type: cc.String })
    public soundId: string = "";

    @property({ type: cc.AudioClip })
    public soundResource: cc.AudioClip = null;

    @property({ type: Number })
    public volume: number = -1;

    constructor(){
        this.soundId = "";
        this.soundResource = null;
        this.volume = -1
    }
}

/** 中奖符号音效信息实体类 - 原JS内联构造函数 SymbolWinSoundInfo 转换 */
@ccclass()
export class SymbolWinSoundInfo {
    @property({ type: Number })
    public symbolId: number = 0;

    @property({ type: cc.String })
    public soundId: string = "";

    @property({ type: Number })
    public currentTime: number = 0;
}

/** 老虎机音效控制器主类 */
@ccclass
export default class SlotSoundController extends cc.Component {
    // ========== 序列化属性 (原JS @property 配置完全复刻，变量名/类型/默认值/数组/单对象 完全一致) ==========
    @property({ type: cc.Boolean })
    public useCommonSound: boolean = true;

    @property({ type: cc.Boolean })
    public useLinkedJackpotSound: boolean = false;

    @property({ type: cc.Boolean })
    public useDynamicReelsSound: boolean = false;

    @property({ type: [SymbolWinSoundInfo] })
    public symbolWinSoundList: SymbolWinSoundInfo[] = [];

    @property({ type: [SlotSoundInfo] })
    public commonList: SlotSoundInfo[] = [];

    @property({ type: [SlotSoundInfo] })
    public soundList: SlotSoundInfo[] = [];

    @property({ type: [SlotSoundInfo] })
    public defaultWinSoundList: SlotSoundInfo[] = [];

    // ========== 私有成员变量 (原JS隐式声明，补全TS类型+初始化值，无任何改动) ==========
    private commonSoundController: any = null;
    private linkedJackpotSoundController: any = null;
    private allSoundListForSearch: SlotSoundInfo[] = [];

    // ========== 单例模式 (原JS静态属性+方法完全复刻) ==========
    private static _instance: SlotSoundController = null;
    public static Instance(): SlotSoundController {
        return SlotSoundController._instance;
    }

    // ========== 生命周期回调 - onLoad 完全复刻原JS逻辑，异步加载+数据组装，一行不改 ==========
    onLoad(): void {
        const self = this;
        SlotSoundController._instance = this;

        // 加载公共音效容器
        cc.loader.loadRes("SlotCommon/Prefab/SlotCommonSoundContainer", function (err, prefab) {
            if (err) {
                cc.log("SlotCommonSoundContainer error, ", JSON.stringify(err));
            } else {
                const inst = cc.instantiate(prefab);
                self.commonSoundController = inst.getComponent("SlotCommonSoundContainer");
                
                // 组装本类音效列表
                for (let i = 0; i < self.soundList.length; ++i) {
                    if (!self.isInSoundListForSearch(self.soundList[i].soundId) && self.soundList[i].soundResource != null) {
                        self.allSoundListForSearch.push(self.soundList[i]);
                    }
                }
                // 组装公共音效列表
                for (let i = 0; i < self.commonList.length; ++i) {
                    if (!self.isInSoundListForSearch(self.commonList[i].soundId) && self.commonList[i].soundResource != null) {
                        self.allSoundListForSearch.push(self.commonList[i]);
                    }
                }
                // 组装公共容器音效列表
                if (self.useCommonSound) {
                    for (let i = 0; i < self.commonSoundController.soundList.length; ++i) {
                        if (!self.isInSoundListForSearch(self.commonSoundController.soundList[i].soundId) && self.commonSoundController.soundList[i].soundResource != null) {
                            self.allSoundListForSearch.push(self.commonSoundController.soundList[i]);
                        }
                    }
                }
            }
        });

        // 加载连线大奖音效容器
        if (this.useLinkedJackpotSound) {
            cc.loader.loadRes("SlotCommon/Prefab/SlotLinkedJackpotSoundContainer", function (err, prefab) {
                const inst = cc.instantiate(prefab);
                self.linkedJackpotSoundController = inst.getComponent("SlotCommonSoundContainer");
                for (let i = 0; i < self.linkedJackpotSoundController.soundList.length; ++i) {
                    if (!self.isInSoundListForSearch(self.linkedJackpotSoundController.soundList[i].soundId) && self.linkedJackpotSoundController.soundList[i].soundResource != null) {
                        self.allSoundListForSearch.push(self.linkedJackpotSoundController.soundList[i]);
                    }
                }
            });
        }

        // 加载动态滚轮音效容器
        if (this.useDynamicReelsSound) {
            cc.loader.loadRes("SlotCommon/Prefab/SlotDynamicReelsSoundContainer", function (err, prefab) {
                const inst = cc.instantiate(prefab);
                self.linkedJackpotSoundController = inst.getComponent("SlotCommonSoundContainer");
                for (let i = 0; i < self.linkedJackpotSoundController.soundList.length; ++i) {
                    if (!self.isInSoundListForSearch(self.linkedJackpotSoundController.soundList[i].soundId) && self.linkedJackpotSoundController.soundList[i].soundResource != null) {
                        self.allSoundListForSearch.push(self.linkedJackpotSoundController.soundList[i]);
                    }
                }
            });
        }
    }

    // ========== 所有业务方法 - 按原JS顺序完全复刻，逻辑/判断/数值/日志 无任何改动 ==========
    isInSoundListForSearch(soundId: string): boolean {
        let isExist = false;
        for (let i = 0; i < this.allSoundListForSearch.length; ++i) {
            if (this.allSoundListForSearch[i].soundId == soundId) {
                isExist = true;
                break;
            }
        }
        return isExist;
    }

    getAudioClip(soundId: string): cc.AudioClip {
        let audioClip = null;
        for (let i = 0; i < this.allSoundListForSearch.length; ++i) {
            const soundInfo = this.allSoundListForSearch[i];
            if (soundInfo.soundId == soundId && soundInfo.soundResource != null) {
                audioClip = soundInfo.soundResource;
                break;
            }
        }
        if (audioClip == null) {
            cc.log(soundId + " sound does not exist in SlotSouncController"); // 原JS 拼写错误 严格保留：SlotSouncController (少d)
        }
        return audioClip;
    }

    getVolume(soundId: string): number {
        let volume = null;
        for (let i = 0; i < this.allSoundListForSearch.length; ++i) {
            const soundInfo = this.allSoundListForSearch[i];
            if (soundInfo.soundId == soundId && soundInfo.soundResource != null) {
                volume = (soundInfo.volume >= 0 && soundInfo.volume <= 1) ? soundInfo.volume : null;
                break;
            }
        }
        return volume;
    }

    setEachSoundVolume(soundId: string, volume: number): void {
        for (let i = 0; i < this.allSoundListForSearch.length; ++i) {
            const soundInfo = this.allSoundListForSearch[i];
            if (soundInfo.soundId == soundId && soundInfo.soundResource != null) {
                soundInfo.volume = volume;
                break;
            }
        }
    }

    playAudio(soundId: string, soundType: string, currentTime: number = 0): any {
        const audioClip = this.getAudioClip(soundId);
        const volume = this.getVolume(soundId);
        let playId = null;

        if (audioClip != null) {
            switch (soundType) {
                case "BGM":
                    SoundManager.Instance().playBGM(audioClip, volume);
                    break;
                case "FX":
                    playId = SoundManager.Instance().playFxOnce(audioClip, currentTime, volume);
                    break;
                case "FXLoop":
                    SoundManager.Instance().playFxLoop(audioClip, volume);
                    break;
            }
        }
        return playId;
    }

    stopAudio(soundId: string, soundType: string): void {
        const audioClip = this.getAudioClip(soundId);
        switch (soundType) {
            case "BGM":
                SoundManager.Instance().stopBGM();
                break;
            case "FX":
                SoundManager.Instance().stopFxOnce(audioClip);
                break;
            case "FXLoop":
                SoundManager.Instance().stopFxLoop(audioClip);
                break;
        }
    }

    playAudioEventHandler(event: cc.Event, data: string): void {
        const params = JSON.parse(data);
        this.playAudio(params[0], params[1]);
    }

    playNormalWinSound(): void {
        if (this.defaultWinSoundList.length === 0) {
            const audioClip = this.getAudioClip("DefaultWin");
            const volume = this.getVolume("DefaultWin");
            SoundManager.Instance().playFxOnce(audioClip, 0, volume);
        } else {
            const randomVal = Math.random();
            const randomIdx = Math.floor(randomVal * this.defaultWinSoundList.length);
            const audioClip = this.defaultWinSoundList[randomIdx].soundResource;
            let volume = this.defaultWinSoundList[randomIdx].volume;
            volume = this.defaultWinSoundList[randomIdx].volume >= 0 ? this.defaultWinSoundList[randomIdx].volume : null;
            SoundManager.Instance().playFxOnce(audioClip, 0, volume);
        }
    }

    playWinSound(symbolIds: number[]): void {
        const playSoundIds: string[] = [];
        const playCurrTimes: number[] = [];
        let targetSymbolId = 0;

        for (let i = 0; i < this.symbolWinSoundList.length; ++i) {
            targetSymbolId = this.symbolWinSoundList[i].symbolId;
            if (symbolIds.indexOf(targetSymbolId) !== -1) {
                for (let j = 0; j < this.symbolWinSoundList.length; ++j) {
                    if (this.symbolWinSoundList[j].symbolId == targetSymbolId) {
                        playSoundIds.push(this.symbolWinSoundList[j].soundId);
                        playCurrTimes.push(this.symbolWinSoundList[j].currentTime);
                    }
                }
                break;
            }
        }

        if (playSoundIds.length > 0) {
            for (let i = 0; i < playSoundIds.length; ++i) {
                this.playAudio(playSoundIds[i], "FX", playCurrTimes[i]);
            }
        } else {
            this.playNormalWinSound();
        }
    }

    setMainVolumeTemporarily(volume: number): void {
        SoundManager.Instance().setMainVolumeTemporarily(volume);
    }

    resetTemporarilyMainVolume(): void {
        SoundManager.Instance().resetTemporarilyMainVolume();
    }
}