const { ccclass, property } = cc._decorator;


import ChangeNumberComponent from "../../../Script/Slot/ChangeNumberComponent";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import GameComponents_Base from "../../../Script/game/GameComponents_Base";
import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import PopupSetting, { Popup_Msg } from "../../../Script/manager/PopupSetting";
import SlotManager from "../../../Script/manager/SlotManager";
import JackpotDisplay_MoooreCheddar from "./JackpotDisplay_MoooreCheddar";
import { PICK_RECOVERY, SIDE_ANI } from "./MsgDataType_MoooreCheddar";
import PickBonus_MoooreCheddar from "./PickBonus_MoooreCheddar";

/**
 * Mooore Cheddar老虎机游戏组件
 * 核心功能：弹窗控制、Jackpot显示、角色动画、相机震动、奖励弹窗、PickBonus交互等
 */
@ccclass()
export default class GameComponent_MoooreCheddar extends GameComponents_Base {
    // ================= 组件绑定（与原代码property一一对应） =================
    @property(PopupSetting)
    popup_manager: PopupSetting = null;          // 弹窗管理器
    @property(cc.Animation)
    top_animation: cc.Animation = null;             // 顶部动画组件
    @property(sp.Skeleton)
    top_ani_character: sp.Skeleton = null;       // 顶部角色骨骼动画
    @property(JackpotDisplay_MoooreCheddar)
    jackpot_display: JackpotDisplay_MoooreCheddar = null; // Jackpot显示组件
    @property(PickBonus_MoooreCheddar)
    pick_bonus: PickBonus_MoooreCheddar = null;  // 奖励选择组件
    @property(sp.Skeleton)
    side_character: sp.Skeleton = null;          // 侧边角色骨骼动画
    @property(cc.Animation)
    smoke_node: cc.Animation = null;                // 烟雾动画节点
    @property(cc.Animation)
    camera_shaker: cc.Animation = null;             // 相机震动动画
    @property([cc.Node])
    explane_node: cc.Node[] = [];                   // 说明节点数组

    // ================= 业务属性 =================
    private game_manager: SlotManager = null;    // 老虎机管理器实例
    private play_animation: ((e: number) => void) | null = null; // 角色动画播放回调

    // 角色动画配置（与原代码完全一致）
    private character_animation = [
        { name: "Top_Idle_1", loop: true },
        { name: "Top_Expect_Win", loop: false },
        { name: "Top_Expect_Feature", loop: false },
        { name: "Top_Feature_Trigger", loop: false },
        { name: "Top_Trigger", loop: false },
        { name: "Top_J1_Light_Move_Start", loop: false },
        { name: "Top_J1_Light_Move_Ing", loop: true },
        { name: "Top_J1_Light_Move_End", loop: false }
    ];

    constructor(){
        super()
    }

    // ================= 生命周期方法 =================
    /**
     * 组件加载初始化
     * 绑定父类逻辑、注册动画回调、事件监听、初始化弹窗管理器
     */
    onLoad(): void {
        super.onLoad(); // 调用父类onLoad

        // 绑定侧边角色动画完成回调
        this.side_character.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
            if (!trackEntry.loop) {
                if (trackEntry.animation.name === this.character_animation[SIDE_ANI.START].name) {
                    // 播放循环动画
                    this.side_character.setAnimation(
                        0,
                        this.character_animation[SIDE_ANI.LOOP].name,
                        this.character_animation[SIDE_ANI.LOOP].loop
                    );
                } else {
                    // 播放闲置动画
                    this.side_character.setAnimation(
                        0,
                        this.character_animation[SIDE_ANI.IDLE].name,
                        this.character_animation[SIDE_ANI.IDLE].loop
                    );
                }
            }
        });

        // 绑定烟雾动画结束事件
        this.smoke_node.on(cc.Animation.EventType.FINISHED, () => {
            this.smoke_node.node.active = false;
        });

        // 初始化弹窗管理器回调
        this.popup_manager.initializeFunction = this.onPopupSetting.bind(this);
        this.game_manager = SlotManager.Instance;

        // 注册节点事件监听
        this.node.on("onJackpotDisplayFunction", this.onJackpotDisplayFunction, this);
        this.node.on("onOpenPopup", this.onOpenPopup, this);
        this.node.on("onResetPlayAnimationWhileSpinning", this.onResetPlayAnimationWhileSpinning, this);
        this.node.on("onPlayCharacterAnimationWhileSpinning", this.onPlayCharacterAnimationWhileSpinning, this);
        this.node.on("onSideCharacterAnimation", this.onSideCharacterAnimation, this);
        this.node.on("onSideSmoke", this.onSideSmoke, this);
        this.node.on("onCameraShake", this.onCameraShake, this);
        this.node.on("openPickBonus", this.openPickBonus, this);
        this.node.on("sendPickBonus", this.sendPickBonus, this);
        this.node.on("setExplaneNode", this.setExplaneNode, this);
    }

    /**
     * 组件销毁清理
     * 解绑所有自定义事件
     */
    onDestroy(): void {
        this.node.off("onJackpotDisplayFunction");
        this.node.off("onOpenPopup");
        this.node.off("onResetPlayAnimationWhileSpinning");
        this.node.off("onPlayCharacterAnimationWhileSpinning");
        this.node.off("onSideCharacterAnimation");
        this.node.off("onSideSmoke");
        this.node.off("onCameraShake");
        this.node.off("openPickBonus");
        this.node.off("sendPickBonus");
        this.node.off("setExplaneNode");
        // super.onDestroy();
    }

    // ================= 弹窗控制逻辑 =================
    /**
     * 打开弹窗
     * @param popupData 弹窗数据
     * @param callback 弹窗回调（默认null）
     */
    onOpenPopup(popupData: any, callback: Function | null = null): void {
        // 禁用输入
        this.game_manager.setKeyboardEventFlag(false);
        this.game_manager.setMouseDragEventFlag(false);

        // Jackpot弹窗音效处理
        if (popupData.type === 5) {
            if (popupData.params.multiplier > 1) {
                this.popup_manager.popup_list[popupData.type].origin_sound_id = "MJR";
                this.popup_manager.popup_list[popupData.type].sound_id = "MJR";
            } else {
                this.popup_manager.popup_list[popupData.type].origin_sound_id = "JR";
                this.popup_manager.popup_list[popupData.type].sound_id = "JR";
            }
        }

        // 打开弹窗
        this.popup_manager.onOpenPopup(popupData, callback);
    }

    /**
     * 弹窗设置回调（核心弹窗配置逻辑）
     * @param popupComp 弹窗组件实例
     * @param popupParams 弹窗参数
     */
    onPopupSetting(popupComp: any, popupParams: any): void {
        if (!TSUtility.isValid(Popup_Msg)) return;

        // 类型0-1：基础Jackpot显示
        if (popupParams.type < 2) {
            const jackpotIdx = popupParams.jackpot_count === 0 ? -1 : popupParams.jackpot;
            // 控制Sprite显示
            popupComp.sprite_list.forEach((sprite: cc.Node, idx: number) => {
                sprite.active = idx === jackpotIdx;
            });
            // 金额格式化
            const prefix = popupParams.jackpot_count > 0 ? "+" : "";
            popupComp.label_list[1].string = prefix + CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(popupParams.pot, 3);
            // 倍数显示
            if (TSUtility.isValid(popupComp.etc_list[0])) {
                popupComp.etc_list[0].active = popupParams.jackpot_count > 1;
                popupComp.etc_list[0].getComponent(cc.Label).string = "X" + popupParams.jackpot_count.toString();
            }
        }

        // 类型3-4：奖励+倍数+次数显示
        if (popupParams.type > 2 && popupParams.type < 5) {
            // 奖励金额滚动动画
            popupComp.label_list[0].getComponent(ChangeNumberComponent).playChangeNumber(
                0,
                popupParams.reward,
                () => {
                    popupComp.label_list[0].string = CurrencyFormatHelper.formatNumber(popupParams.reward);
                },
                1
            );
            // 倍数显示
            popupComp.label_list[1].string = "X" + CurrencyFormatHelper.formatNumber(popupParams.multiplier);
            // 次数显示
            if (TSUtility.isValid(popupComp.label_list[2])) {
                popupComp.label_list[2].string = popupParams.spins.toString();
            }
            // 调整宽度（大额奖励加宽）
            const width = popupParams.reward > 999999999 ? 468 : 368;
            popupComp.etc_list.forEach((node: cc.Node) => {
                node.width = width;
            });
        }

        // 类型5：Jackpot弹窗（核心逻辑）
        if (popupParams.type === 5) {
            // 玩币特效标记
            const isPlayCoin = TSUtility.isValid(popupParams.playcoin) && popupParams.playcoin === 1;
            popupComp.play_coin_effect = isPlayCoin;
            const coinIdx = isPlayCoin ? 1 : 0;

            // 控制ETC节点显示
            for (let o = 0; o < 8; ++o) {
                popupComp.etc_list[o].active = Math.floor(o / 4) === coinIdx;
            }

            // 控制Sprite显示（Jackpot类型）
            for (let o = 0; o < 4; ++o) {
                popupComp.sprite_list[o].active = o === popupParams.jackpot;
                popupComp.sprite_list[o + 4].active = popupComp.sprite_list[o].active;
                popupComp.sprite_list[o + 8].active = popupComp.sprite_list[o].active;
            }

            // 倍数>1时的金额累加动画
            if (popupParams.multiplier > 1) {
                popupComp.label_list[1].string = "X" + popupParams.multiplier;
                this.scheduleOnce(() => {
                    popupComp.label_list[0].getComponent(ChangeNumberComponent).playChangeNumber(
                        popupParams.reward,
                        popupParams.total_reward,
                        () => {
                            popupComp.label_list[0].string = CurrencyFormatHelper.formatNumber(popupParams.total_reward);
                        },
                        1
                    );
                }, 3.2);
            }

            // 基础奖励金额滚动动画
            popupComp.label_list[0].getComponent(ChangeNumberComponent).playChangeNumber(
                0,
                popupParams.reward,
                () => {
                    popupComp.label_list[0].string = CurrencyFormatHelper.formatNumber(popupParams.reward);
                },
                1
            );

            // Jackpot动画播放
            const grandSuffix = popupParams.jackpot === 3 ? "_Grand" : "";
            const aniName = "Jackpot_" + (popupParams.multiplier > 1 ? "Multi_" : "") + "Open_Ani" + grandSuffix;
            popupComp.node.active = true;
            popupComp.ani_pivot.active = true;
            popupComp.ani_pivot.getComponent(Animation).play(aniName, 0);

            // 获取Jackpot类型
            const jackpotData = {
                params: {
                    jackpot_type: popupParams.jackpot < 3 ? popupParams.jackpot : 4
                }
            };
            this.popup_manager.getJackpotType(jackpotData, popupComp);

            // 调整宽度
            const width = popupParams.reward > 999999999 ? 468 : 368;
            popupComp.etc_list[8].width = width;
            popupComp.etc_list[9].width = width;
        }

        // 类型6：免费旋转后Jackpot显示
        if (popupParams.type === 6) {
            const afterData = popupParams.after;
            const jackpotIdx = afterData.jackpot_count === 0 ? -1 : afterData.jackpot;

            // 控制Sprite显示
            for (let n = 0; n < 4; ++n) {
                popupComp.sprite_list[n].active = n === jackpotIdx;
            }

            // 前缀与金额显示
            const prefix = jackpotIdx > -1 ? "+" : "";
            popupComp.sprite_list[0].parent.active = jackpotIdx > -1;
            popupComp.label_list[1].string = "X" + afterData.jackpot_count.toString();
            popupComp.label_list[1].node.active = afterData.jackpot_count > 1;
            popupComp.label_list[2].string = prefix + CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(afterData.pot, 3);
            popupComp.label_list[0].string = popupParams.spins;

            // 次数显示控制
            popupComp.etc_list[0].active = popupParams.spins === 1;
            popupComp.etc_list[1].active = !popupComp.etc_list[0].active;
        }
    }

    // ================= 动画控制逻辑 =================
    /**
     * 进入动画播放
     */
    onEnterAnimation(): void {
        this.top_animation.node.active = true;
    }

    /**
     * 进入动画结束
     */
    onEndEnterAnimation(): void {
        this.onTopAnimationPlay(false);
    }

    /**
     * 顶部角色动画播放控制
     * @param isPlay 是否播放（true=播放，false=暂停）
     */
    onTopAnimationPlay(isPlay: boolean): void {
        this.top_ani_character.paused = !isPlay;
    }

    /**
     * 重置旋转时的角色动画回调
     */
    onResetPlayAnimationWhileSpinning(): void {
        if (!TSUtility.isValid(this.play_animation)) {
            this.play_animation = this.onSideCharacterAnimation.bind(this);
        }
    }

    /**
     * 播放旋转时的角色动画
     * @param aniType 动画类型
     */
    onPlayCharacterAnimationWhileSpinning(aniType: number): void {
        if (TSUtility.isValid(this.play_animation)) {
            this.play_animation(aniType);
            delete this.play_animation;
            this.play_animation = null;
        }
    }

    /**
     * 侧边角色动画播放
     * @param aniType 动画类型（对应SIDE_ANI枚举）
     */
    onSideCharacterAnimation(aniType: number): void {
        const targetAni = this.character_animation[aniType];
        if (this.side_character.animation !== targetAni.name) {
            // 播放指定动画
            this.side_character.setAnimation(0, targetAni.name, targetAni.loop);

            // TRIGGER类型动画的额外处理（音效+烟雾+相机震动）
            if (aniType === SIDE_ANI.TRIGGER) {
                SlotSoundController.Instance().playAudio("SC", "FX");
                this.onSideSmoke();

                // 延迟播放相机震动
                this.scheduleOnce(() => {
                    this.onCameraShake();
                }, 3);

                // 延迟恢复闲置动画
                this.scheduleOnce(() => {
                    this.side_character.setAnimation(0, this.character_animation[0].name, this.character_animation[0].loop);
                }, 4);
            }
        }
    }

    /**
     * 播放侧边烟雾特效
     */
    onSideSmoke(): void {
        this.smoke_node.node.active = true;
    }

    /**
     * 播放相机震动动画
     */
    onCameraShake(): void {
        this.camera_shaker.play("Camera_Shake", 0);
    }

    // ================= Jackpot与奖励控制 =================
    /**
     * Jackpot显示功能回调
     * @param data Jackpot显示数据
     */
    onJackpotDisplayFunction(data: any): void {
        if (TSUtility.isValid(this.jackpot_display[data.name])) {
            this.jackpot_display[data.name](data);
        }
    }

    /**
     * 打开奖励选择弹窗
     * @param isActive 是否激活（默认true）
     * @param isFreeSpinBonus 是否免费旋转奖励（默认false）
     */
    openPickBonus(isActive: boolean = true, isFreeSpinBonus: boolean = false): void {
        this.pick_bonus.node.active = isActive;
        this.pick_bonus.inFreeSpinBonus = isFreeSpinBonus;
    }

    /**
     * 发送奖励选择消息
     * @param msg 奖励消息数据
     */
    sendPickBonus(msg: PICK_RECOVERY): void {
        this.pick_bonus.sendMsg(msg);
    }

    /**
     * 设置说明节点显示
     * @param data 说明节点数据
     */
    setExplaneNode(data: any): void {
        // 控制Jackpot类型显示
        const jackpotIdx = data.jackpot_count === 0 ? -1 : data.jackpot;
        this.explane_node.forEach((node: cc.Node, idx: number) => {
            node.active = idx === jackpotIdx;
        });
        this.explane_node[0].parent.active = jackpotIdx > -1;

        // 前缀处理
        const prefix = data.jackpot_count === 0 ? "" : "+";

        // 倍数显示
        if (data.jackpot_count > 1) {
            this.explane_node[4].getComponent(cc.Label).string = "X" + data.jackpot_count.toString();
        }
        this.explane_node[4].active = data.jackpot_count > 1;

        // 金额显示
        if (data.money > 0) {
            this.explane_node[5].getComponent(cc.Label).string = prefix + CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(data.money, 3);
        } else {
            this.explane_node[5].getComponent(cc.Label).string = prefix + "0";
        }
    }
}