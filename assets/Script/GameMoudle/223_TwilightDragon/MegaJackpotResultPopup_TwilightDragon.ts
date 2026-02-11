import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import GameResultPopup from "../../Slot/GameResultPopup";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

// 定义常量：替换魔法值，简化后续维护
const AUDIO_KEY_MEGA_JACKPOT_POPUP = "MegaJackpotResultPopup";
const AUDIO_KEY_MEGA_WIN = "MegaWin";
const AUDIO_KEY_BIG_WIN_COIN_BURST = "BigWin_CoinBurst";
const AUDIO_KEY_BIG_WIN_COIN_BURST_MOVE = "BigWin_CoinBurstMove";
const ANIM_KEY_POPUP_MEGA_RESULT = "Popup_Mega_Result";
const DELAY_TIME_AUTO_CLOSE = 17; // 自动关闭延迟时间（秒）
const DELAY_TIME_MAIN_VOLUME_RESET = 0.1; // 主音量临时重置值
const DELAY_TIME_COIN_BURST_MOVE = 1.1; // 金币移动特效延迟
const DELAY_TIME_COIN_COLLECT_FX = 1.35; // 金币收集特效延迟
const DELAY_TIME_COIN_COLLECT_HIDE = 2.3; // 金币收集特效隐藏延迟
const DELAY_TIME_END_PROCESS_1 = 1.8; // 结束流程第一步延迟
const DELAY_TIME_END_PROCESS_2 = 1.2; // 结束流程第二步延迟

/**
 * 暮光龙超级头奖结果弹窗组件
 * 负责头奖奖励展示、数字滚动、分享功能、金币爆炸特效及结果回调
 */

@ccclass()
export default class MegaJackpotResultPopup_TwilightDragon extends cc.Component {
    // ===== 序列化属性（对应Cocos编辑器挂载，与原始代码一致）=====
    @property(cc.Node)
    public blockingBG: cc.Node | null = null; // 遮罩背景

    @property(cc.Button)
    public collectButton: cc.Button | null = null; // 收集奖励按钮

    @property(cc.Toggle)
    public shareToggle: cc.Toggle | null = null; // 分享开关

    @property(cc.Node)
    public shareRoot: cc.Node | null = null; // 分享模块根节点

    @property([cc.Node])
    public nodesInitScale: cc.Node[] = []; // 初始化缩放节点数组

    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = []; // 初始化透明度节点数组

    @property([cc.Node])
    public jackpotTitle: cc.Node[] = []; // 头奖标题节点数组（对应不同头奖类型）

    @property(cc.Node)
    public shortRoot: cc.Node | null = null; // 短数字展示根节点（奖励<10亿）

    @property(cc.Node)
    public longRoot: cc.Node | null = null; // 长数字展示根节点（奖励>=10亿）

    @property(cc.Label)
    public longRewardLabel: cc.Label | null = null; // 长数字奖励标签

    @property(cc.Label)
    public shortRewardLabel: cc.Label | null = null; // 短数字奖励标签

    @property(cc.Node)
    public root: cc.Node | null = null; // 弹窗根节点

    @property([cc.Node])
    public multiNodes: cc.Node[] = []; // 倍率节点数组

    @property(cc.Animation)
    public winExplodeCoin: cc.Animation | null = null; // 金币爆炸动画组件

    @property(cc.Node)
    public winCoinCollectFx: cc.Node | null = null; // 金币收集特效节点

    // ===== 私有成员变量（对应原始代码的内部状态）=====
    private _goldAmount: number = 0; // 头奖奖励金额
    private _fnCallback: (() => void) | null = null; // 弹窗结束回调函数
    private _isAutoClose: boolean = false; // 是否自动关闭（自动旋转模式）
    private _soundKey: string = ""; // 当前播放的音效Key
    private _jackpotType: number = 0; // 头奖类型
    private _jackpotKey: string = ""; // 头奖Key

    /**
     * 组件加载时初始化（挂载分享存储组件、刷新遮罩尺寸）
     */
    onLoad(): void {
        // if (this.shareToggle && this.shareToggle.node) {
        //     // 为分享开关挂载Facebook分享状态存储组件
        //     this.shareToggle.node.addComponent(FBShareFlagToStorageInGame);
        // }
        // 刷新遮罩背景尺寸适配屏幕
        this.refresh();
    }

    /**
     * 刷新遮罩背景尺寸，适配当前屏幕
     */
    refresh(): void {
        if (this.blockingBG) {
            TSUtility.setNodeViewSizeFit(this.blockingBG);
        }
    }

    /**
     * 打开头奖结果弹窗，初始化展示内容与动画
     * @param goldAmount 头奖总金额
     * @param jackpotKey 头奖Key
     * @param jackpotType 头奖类型
     * @param baseGold 基础金额
     * @param multi 倍率
     * @param callback 弹窗结束回调
     */
    open(
        goldAmount: number,
        jackpotKey: string,
        jackpotType: number,
        baseGold: number,
        multi: number,
        callback?: (() => void) | null
    ): void {
        if (!this.root || !this.collectButton || !this.shareToggle) return;

        // 1. 初始化内部状态
        SoundManager.Instance().setMainVolumeTemporarily(0); // 临时静音主音量
        this._jackpotType = jackpotType;
        this._jackpotKey = jackpotKey;
        this._soundKey = AUDIO_KEY_MEGA_JACKPOT_POPUP;
        this._goldAmount = goldAmount;
        this._fnCallback = callback || null;
        this._isAutoClose = false;

        // 2. 播放头奖弹窗音效，获取音效时长
        const audioClip = SlotSoundController.Instance().playAudio(this._soundKey, "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;

        // 3. 初始化弹窗UI状态
        this.collectButton.interactable = false; // 禁用收集按钮
        this.node.active = true;
        this.root.active = true;
        this.node.opacity = 255;
        if (this.blockingBG) {
            this.blockingBG.active = true;
            this.blockingBG.opacity = 0;
        }

        // 4. 重置透明度节点为透明
        this.nodesInitOpacity.forEach(node => {
            if (node) node.opacity = 0;
        });

        // 5. 激活所有粒子系统（特效）
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        particleSystems.forEach(particle => {
            if (particle && particle.node) {
                particle.node.active = true;
            }
        });

        // 6. 控制分享模块显示/隐藏（判断是否禁用Facebook分享）
        if (this.shareRoot) {
            this.shareRoot.active = SlotManager.Instance.isFBShareDisableTarget() === 0;
        }

        // 7. 选择数字展示节点（短数字/长数字）
        const isLongNumber = goldAmount > 999999999;
        let targetRoot:cc.Node | null = null;
        if (isLongNumber) {
            if (this.longRoot) this.longRoot.active = true;
            if (this.shortRoot) this.shortRoot.active = false;
            targetRoot = this.longRoot;
        } else {
            if (this.longRoot) this.longRoot.active = false;
            if (this.shortRoot) this.shortRoot.active = true;
            targetRoot = this.shortRoot;
        }

        // 8. 激活对应头奖标题与倍率节点
        this.jackpotTitle.forEach((titleNode, index) => {
            if (titleNode) titleNode.active = index === jackpotType;
        });
        const multiIndex = multi - 2;
        this.multiNodes.forEach((multiNode, index) => {
            if (multiNode) multiNode.active = index === multiIndex;
        });

        // 9. 初始化奖励标签为0，禁用分享开关
        if (isLongNumber && this.longRewardLabel) {
            this.longRewardLabel.string = "0";
        } else if (!isLongNumber && this.shortRewardLabel) {
            this.shortRewardLabel.string = "0";
        }
        this.shareToggle.interactable = false;

        // 10. 播放弹窗入场动画
        const rootAnim = this.root.getComponent(cc.Animation);
        if (rootAnim) {
            rootAnim.stop();
            rootAnim.play(ANIM_KEY_POPUP_MEGA_RESULT, 0);
        }

        // 11. 计算数字滚动中间值，配置数字滚动动画
        const middleGold = (this._goldAmount - baseGold) / multi + baseGold;
        this.scheduleOnce(() => {
            if (!targetRoot) return;
            const changeNumberComp = targetRoot.getComponent(ChangeNumberComponent);
            if (!changeNumberComp) return;

            // 第一步：从0滚动到中间值
            changeNumberComp.playChangeNumber(0, middleGold, () => {
                if (multi > 1) {
                    // 倍率>1：延迟1秒后，从中间值滚动到总金额
                    this.scheduleOnce(() => {
                        this.finishNumberRoll(changeNumberComp, middleGold);
                    }, 1);
                } else {
                    // 倍率=1：延迟0.8秒后，直接启用按钮
                    this.scheduleOnce(() => {
                        this.enableButtons();
                    }, 0.8);
                }
            }, 1.6);
        }, 1.5);

        // 12. 延迟恢复主音量（按音效时长）
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(DELAY_TIME_MAIN_VOLUME_RESET);
        }, audioDuration);

        // 13. 自动旋转模式：延迟自动关闭弹窗
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                this._isAutoClose = true;
                this.onClickCollect();
            }, DELAY_TIME_AUTO_CLOSE);
        }
    }

    /**
     * 点击收集奖励按钮（停止音效，触发分享/特效流程）
     */
    onClickCollect(): void {
        this.unscheduleAllCallbacks(); // 取消所有未执行的延迟任务
        SlotSoundController.Instance().stopAudio(this._soundKey, "FX"); // 停止头奖弹窗音效
        this.share(); // 处理分享逻辑，后续触发金币特效
    }

    /**
     * 播放金币爆炸与收集特效（核心视觉反馈）
     */
    playExplodeCoinEffect(): void {
        if (!this.winExplodeCoin || !this.winCoinCollectFx || !this.blockingBG || !this.root) return;

        // 1. 停止大赢音效循环
        SlotSoundController.Instance().stopAudio(AUDIO_KEY_MEGA_WIN, "FXLoop");

        // 2. 计算金币收集特效目标位置（转换世界坐标到节点本地坐标）
        const coinTargetNode = SlotManager.Instance._inGameUI?.bigwinCoinTarget;
        if (!coinTargetNode) return;
        const worldPos = coinTargetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const parentNode = this.winCoinCollectFx.parent;
        if (!parentNode) return;
        const localPos = parentNode.convertToNodeSpaceAR(worldPos);
        this.winCoinCollectFx.setPosition(localPos);

        // 3. 构建特效执行动作序列
        const explodeAction = cc.callFunc(() => {
            // 激活金币爆炸动画，隐藏遮罩与弹窗根节点
            this.winExplodeCoin.node.active = true;
            this.blockingBG.active = false;
            this.root.active = false;

            // 播放金币爆炸动画与音效
            this.winExplodeCoin.stop();
            this.winExplodeCoin.play();
            SlotSoundController.Instance().playAudio(AUDIO_KEY_BIG_WIN_COIN_BURST, "FX");

            // 延迟播放金币移动特效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio(AUDIO_KEY_BIG_WIN_COIN_BURST_MOVE, "FX");
            }, DELAY_TIME_COIN_BURST_MOVE);

            // 延迟激活金币收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx.active = true;
            }, DELAY_TIME_COIN_COLLECT_FX);

            // 延迟隐藏金币收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx.active = false;
            }, DELAY_TIME_COIN_COLLECT_HIDE);
        }, this);

        // 4. 执行完整特效与结果处理流程
        const actionSequence = cc.sequence(
            explodeAction,
            cc.delayTime(DELAY_TIME_END_PROCESS_1),
            cc.callFunc(() => {
                // 应用游戏结果，更新金币金额
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._goldAmount);
            }, this),
            cc.delayTime(DELAY_TIME_END_PROCESS_2),
            cc.callFunc(() => {
                // 结束弹窗流程，触发回调
                this.endProcess();
            }, this)
        );

        this.node.runAction(actionSequence);
    }

    /**
     * 处理Facebook分享逻辑（可选分享，分享后再播放特效）
     */
    share(): void {
        if (!this.shareToggle) return;

        // 分享条件：未禁用FB分享、分享开关勾选、非自动关闭
        const canShare = SlotManager.Instance.isFBShareDisableTarget() === 0
            && this.shareToggle.isChecked
            && !this._isAutoClose;

        if (canShare) {
            const shareJackpotType = this._jackpotType + 1;
            // 获取头奖分享信息，执行FB分享
            const shareInfo = GameResultPopup.getJackpotGameShareInfo(this._goldAmount, shareJackpotType);
            SlotManager.Instance.facebookShare(shareInfo, () => {
                // 分享成功后，播放金币特效
                this.playExplodeCoinEffect();
            });
        } else {
            // 不满足分享条件，直接播放金币特效
            this.playExplodeCoinEffect();
        }
    }

    /**
     * 结束弹窗流程，重置UI状态并触发回调
     */
    endProcess(): void {
        // 1. 重置弹窗UI状态
        this.node.active = false;
        if (this.blockingBG) this.blockingBG.active = false;
        if (this.collectButton) this.collectButton.clickEvents = [];

        // 2. 恢复主音量到原始值
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 3. 触发弹窗结束回调（如有）
        if (this._fnCallback) {
            this._fnCallback();
        }
    }

    // ===== 私有辅助方法 =====
    /**
     * 完成数字滚动动画，启用按钮
     * @param changeNumberComp 数字滚动组件
     * @param middleGold 中间金额值
     */
    private finishNumberRoll(changeNumberComp: ChangeNumberComponent, middleGold: number): void {
        changeNumberComp.playChangeNumber(middleGold, this._goldAmount, () => {
            this.enableButtons();
        }, 2);
    }

    /**
     * 启用分享开关与收集按钮，绑定收集按钮点击事件
     */
    private enableButtons(): void {
        if (!this.shareToggle || !this.collectButton || !this.node) return;

        this.shareToggle.interactable = true;
        this.collectButton.interactable = true;

        // 为收集按钮添加点击事件处理器
        const eventHandler = Utility.getComponent_EventHandler(
            this.node,
            "MegaJackpotResultPopup_TwilightDragon",
            "onClickCollect",
            ""
        );
        this.collectButton.clickEvents.push(eventHandler);
    }
}