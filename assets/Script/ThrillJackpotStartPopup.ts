import DialogBase from "./DialogBase";
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import PopupManager from "./manager/PopupManager";
import SoundManager from "./manager/SoundManager";

// Cocos 2.x 标准头部解构写法 (指定要求)
const { ccclass, property } = cc._decorator;

/**
 * ThrillJackpot 启动弹窗组件
 * 负责 jackpot 启动时的弹窗显示、动画播放、音效触发
 */
@ccclass()
export default class ThrillJackpotStartPopup extends DialogBase {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Animation, displayName: '主动画组件' })
    main_Ani: cc.Animation = null;

    @property({ type: [cc.Node], displayName: '轮盘节点列表' })
    wheels: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: '灯光1节点列表' })
    lights_1: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: '灯光2节点列表' })
    lights_2: cc.Node[] = [];

    /**
     * 静态方法：获取弹窗实例（异步加载资源并创建）
     * @param callback 回调函数 (error: Error, popup: ThrillJackpotStartPopup)
     */
    static getPopup(callback: (error: Error | null, popup: ThrillJackpotStartPopup | null) => void): void {
        const resPath = "Service/01_Content/ThrillWheel/ThrillJackpotStartPopup";
        
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 加载弹窗预制体资源
        cc.loader.loadRes(resPath, (error: Error | null, prefab: any) => {
            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);

            // 资源加载失败处理
            if (error) {
                DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(error)}`);
                callback(error, null);
                return;
            }

            // 实例化预制体并获取组件
            const popupNode = cc.instantiate(prefab);
            const popupComp = popupNode.getComponent(ThrillJackpotStartPopup);
            popupNode.active = false; // 初始隐藏

            callback(null, popupComp);
        });
    }

    onLoad() {
        // 初始化弹窗基类
        this.initDailogBase();
    }

    /**
     * 打开弹窗
     * @param wheelIdx 轮盘索引（1开始）
     */
    open(wheelIdx: number): void {
        // 先隐藏所有轮盘和灯光
        this.wheels.forEach((wheelNode) => wheelNode.active = false);
        this.lights_1.forEach((lightNode) => lightNode.active = false);
        this.lights_2.forEach((lightNode) => lightNode.active = false);

        // 显示指定索引的轮盘和灯光（索引转0开始）
        const targetIdx = wheelIdx - 1;
        if (this.wheels[targetIdx]) this.wheels[targetIdx].active = true;
        if (this.lights_1[targetIdx]) this.lights_1[targetIdx].active = true;
        if (this.lights_2[targetIdx]) this.lights_2[targetIdx].active = true;

        // 播放弹窗出现音效
        const soundSetter = this.node.getComponent(CommonSoundSetter);
        if (soundSetter) {
            SoundManager.Instance().playFxOnce(soundSetter.getAudioClip("thrill_wheel_title_appear"));
        }

        // 播放主动画
        if (this.main_Ani) {
            this.main_Ani.stop();
            this.main_Ani.play("WheelGame_Idle_Ani", 0);
        }

        // 调用基类打开方法
        this._open(null);

        // 4秒后自动关闭弹窗
        this.scheduleOnce(() => {
            this._close(null);
        }, 4);
    }
}