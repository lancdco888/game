// SlotCommonSoundContainer.ts
const { ccclass, property } = cc._decorator;

/**
 * 音效信息类 - 单个音效的配置项
 */
@ccclass()
export class SlotCommonSoundInfo {
    // 音效ID
    @property({ type: cc.String, displayName: '音效ID' })
    soundId: string = "";

    // 音效资源
    @property({ type: cc.AudioClip, displayName: '音效资源' })
    soundResource: cc.AudioClip = null;

    // 音效音量（-1 表示使用默认音量）
    @property({ displayName: '音效音量' })
    volume: number = -1;
}

/**
 * 通用音效容器组件 - 管理一组音效配置
 */
@ccclass
export default class SlotCommonSoundContainer extends cc.Component {
    // 音效列表
    @property({ 
        type: [SlotCommonSoundInfo], 
        displayName: '音效列表',
        tooltip: '存放所有需要管理的音效配置'
    })
    soundList: SlotCommonSoundInfo[] = [];

    constructor(){
        super()
    }

    onLoad() {
        // 原逻辑为空，保持兼容
    }
}