const { ccclass, property } = cc._decorator;

import GameCommonSound from "./GameCommonSound";
import HyperBountyUI, { HyperBountyUIType } from "./HyperBountyUI";
import CommonServer from "./Network/CommonServer";
import ServiceInfoManager from "./ServiceInfoManager";
import UserPromotion, { HyperBountyDailyNormalPromotionInfo } from "./User/UserPromotion";
import AsyncHelper from "./global_utility/AsyncHelper";
import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import HyperBountyManager, { HyperBountyMissionType, HyperBountyPopupOpenInfo } from "./manager/HyperBountyManager";
import PopupManager, { OpenPopupInfo } from "./manager/PopupManager";
import MessageRoutingManager from "./message/MessageRoutingManager";


/**
 * HyperBounty（超级赏金）游戏内 UI 组件
 * 负责赏金任务进度显示、动画播放、任务更新、弹窗交互、倒计时重置等核心逻辑
 */
@ccclass()
export default class HyperBountyInGameUI extends cc.Component {
    // === 常量定义 ===
    private readonly ANIMATION_NAME = "100Complete_Effect_ClassicSlot2"; // 100%完成动画名称

    // === 编辑器序列化属性 ===
    @property({ type: cc.Button, displayName: '主交互按钮' })
    button: cc.Button = null;

    @property({ type: cc.Animation, displayName: '完成动画组件' })
    anim: cc.Animation = null;

    @property({ type: cc.Node, displayName: '提示框节点' })
    nodeTooltip: cc.Node = null;

    @property({ type: cc.Node, displayName: '即将上线提示节点' })
    nodeCommingSoon: cc.Node = null;

    @property({ type: cc.Label, displayName: '提示文本1' })
    lblTooltip_1: cc.Label = null;

    @property({ type: cc.Label, displayName: '提示文本2' })
    lblTooltip_2: cc.Label = null;

    @property({ type: [cc.Node], displayName: '旋转次数显示节点列表' })
    spinCountNodes: cc.Node[] = [];

    @property({ type: [cc.Label], displayName: '旋转次数文本列表' })
    spinCountLabels: cc.Label[] = [];

    @property({ type: cc.Node, displayName: '任务失败提示节点' })
    missionFailTooltipNode: cc.Node = null;

    // === 私有状态属性 ===
    private _infoMission: any = null; // 当前任务信息
    private _isSuperMission: boolean = false; // 是否为超级任务
    private _numRunningMissionIndex: number = -1; // 运行中任务索引
    private _numNextResetDate: number = 0; // 日常任务下次重置时间戳
    private _numSuperNextResetDate: number = 0; // 超级任务下次重置时间戳
    private _isSuperMissionReceive: boolean = false; // 是否已领取超级任务奖励
    private _isSpinWinMission: boolean = false; // 是否为赢取旋转任务
    private _prevSubCnt: number = 0; // 上一次子任务计数
    private _arrProgress: cc.Sprite[] = []; // 进度条精灵数组
    private _arrPercent: cc.Label[] = []; // 进度百分比文本数组
    private _arrIconN: cc.Node[] = []; // 普通图标节点数组
    private _arrIconR: cc.Node[] = []; // 超级图标节点数组
    private _arrRedDot: cc.Node[] = []; // 红点节点数组
    private _arrRedDotCount: cc.Label[] = []; // 红点计数文本数组
    private _arrOffNode: cc.Node[] = []; // 禁用节点数组
    private _isFirstCompleteAllMission: boolean = true; // 是否首次完成所有任务
    private _prevProgress: number = 0; // 上一次进度值
    private _openInfo: any = null; // 弹窗打开信息

    onLoad() {
        // 绑定按钮点击事件
        this.button.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "HyperBountyInGameUI", "onClick", "")
        );

        // 监听任务更新和旋转次数更新事件
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.HYPER_BOUNTY_MISSION_UPDATE,
            this.updateMissionInfo.bind(this),
            this
        );
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.HYPER_BOUNTY_SPIN_COUNT_UPDATE,
            this.updateSpinCountPreDecrease.bind(this),
            this
        );

        // 初始化进度条、文本、图标等组件数组（从按钮子节点遍历）
        for (let e = 0; e < this.button.node.childrenCount; e++) {
            const childNode = this.button.node.children[e];
            if (!TSUtility.isValid(childNode)) continue;

            for (let n = 0; n < childNode.childrenCount; n++) {
                const grandChildNode = childNode.children[n];
                if (!TSUtility.isValid(grandChildNode)) continue;

                // 进度百分比文本
                if (grandChildNode.name.includes("_Font")) {
                    const label = grandChildNode.getComponent(cc.Label);
                    if (TSUtility.isValid(label)) this._arrPercent.push(label);
                }

                // 进度条精灵
                if (grandChildNode.name.includes("_Gauge")) {
                    const sprite = grandChildNode.getComponent(cc.Sprite);
                    if (TSUtility.isValid(sprite)) this._arrProgress.push(sprite);
                }

                // 普通图标
                if (grandChildNode.name.includes("_IconN") || grandChildNode.name.includes("_Icon_N")) {
                    this._arrIconN.push(grandChildNode);
                }

                // 超级图标
                if (grandChildNode.name.includes("_IconR") || grandChildNode.name.includes("_Icon_R")) {
                    this._arrIconR.push(grandChildNode);
                }

                // 红点节点
                if (grandChildNode.name.includes("_New")) {
                    this._arrRedDot.push(grandChildNode);
                    const redDotLabel = grandChildNode.getComponentInChildren(cc.Label);
                    if (TSUtility.isValid(redDotLabel)) this._arrRedDotCount.push(redDotLabel);
                }

                // 禁用节点
                if (grandChildNode.name.includes("Off")) {
                    grandChildNode.active = false;
                    this._arrOffNode.push(grandChildNode);
                }
            }
        }

        // 初始化UI状态
        this.spinCountNodes.forEach(node => node.active = false);
        this.updateMissionUI();
        this.nodeTooltip.active = false;
        this.nodeCommingSoon.active = false;
        this.anim.node.active = false;
        this.missionFailTooltipNode.active = false;
    }

    /**
     * 更新任务信息（异步处理网络请求 + 动画播放）
     * @param isForceUpdate 是否强制更新
     */
    async updateMissionInfo(isForceUpdate: boolean = false) {
        // 组件无效或HyperBounty未启动则直接返回
        if (!TSUtility.isValid(this.node) || !HyperBountyManager.instance.isHyperBountyStart()) return;
        if (!isForceUpdate) return;

        try {
            // // 请求领取日常普通赏金奖励
            // const normalPromotionRes = await CommonServer.Instance().asyncRequestAcceptPromotion(
            //     UserInfo.instance().getUid(),
            //     UserInfo.instance().getAccessToken(),
            //     UserPromotion.HyperBountyDailyNormalPromotionInfo.PromotionKeyName,
            //     0,
            //     0,
            //     ""
            // );
            // if (!CommonServer.isServerResponseError(normalPromotionRes)) {
            //     UserInfo.instance().applyChangeResult(UserInfo.instance().getServerChangeResult(normalPromotionRes));
            // }

            // // 请求领取日常超级赏金奖励
            // const superPromotionRes = await CommonServer.Instance().asyncRequestAcceptPromotion(
            //     UserInfo.instance().getUid(),
            //     UserInfo.instance().getAccessToken(),
            //     UserPromotion.HyperBountyDailySuperPromotionInfo.PromotionKeyName,
            //     0,
            //     0,
            //     ""
            // );
            // if (!CommonServer.isServerResponseError(superPromotionRes)) {
            //     UserInfo.instance().applyChangeResult(UserInfo.instance().getServerChangeResult(superPromotionRes));
            // }

            // 首次完成所有任务时更新UI
            if (HyperBountyManager.instance.isCompleteAllMissionIncludeSuper() && !this._isFirstCompleteAllMission) {
                this.updateMissionUI();
            }

            // 处理超级任务逻辑
            if (this._isSuperMission) {
                if (!this._isSuperMissionReceive && HyperBountyManager.instance.numSuperReceiveCount > 0) {
                    await this.playCompleteMissionAction_Super();
                } else {
                    this.updateMissionUI();
                }
            } else {
                // 处理普通任务逻辑
                const runningMissionIdx = HyperBountyManager.instance.numDailyRunningMissionIndex;
                if (this._numRunningMissionIndex < runningMissionIdx || runningMissionIdx < 0) {
                    await this.playCompleteMissionAction();
                } else {
                    if (!this._isSuperMissionReceive && HyperBountyManager.instance.numSuperReceiveCount > 0) {
                        await this.playCompleteMissionAction_Super(true);
                    } else {
                        this.updateMissionUI();
                    }
                }
            }
        } catch (error) {
            console.error("HyperBounty mission update error:", error);
        }
    }

    /**
     * 预减旋转次数更新（赢取旋转任务专用）
     */
    updateSpinCountPreDecrease() {
        if (!this._isSpinWinMission || !this._infoMission) return;
        this.spinCountLabels.forEach(label => {
            label.string = `${CurrencyFormatHelper.formatNumber(
                this._infoMission.numSubGoalCount - (this._infoMission.numSubCurrentCount + 1)
            )}`;
        });
    }

    /**
     * 更新任务UI（进度、图标、红点、倒计时等）
     */
    updateMissionUI() {
        // HyperBounty未启动时重置所有UI
        if (!HyperBountyManager.instance.isHyperBountyStart()) {
            this._arrProgress.forEach(sprite => {
                if (TSUtility.isValid(sprite)) sprite.fillRange = 0;
            });
            this._arrPercent.forEach(label => {
                if (TSUtility.isValid(label)) label.string = "";
            });
            this._arrIconN.forEach(node => {
                if (TSUtility.isValid(node)) node.active = false;
            });
            this._arrIconR.forEach(node => {
                if (TSUtility.isValid(node)) node.active = false;
            });
            this._arrRedDot.forEach(node => node.active = false);
            this._arrOffNode.forEach(node => {
                if (TSUtility.isValid(node)) node.active = true;
            });
            this.nodeTooltip.active = false;
            return;
        }

        // 记录上一次子任务计数
        if (TSUtility.isValid(this._infoMission)) {
            this._prevSubCnt = this._infoMission.numSubCurrentCount;
        }

        // 获取当前任务信息（普通/超级）
        const [isSuper, missionInfo] = this.getMissionInfo();
        this._isSuperMission = isSuper;
        this._infoMission = missionInfo;

        // 计算进度百分比
        const goalCount = TSUtility.isValid(this._infoMission) ? this._infoMission.numGoalCount : 1;
        const currentCount = TSUtility.isValid(this._infoMission) ? this._infoMission.numCurrentCount : 1;
        const progressPercent = Math.floor((currentCount / goalCount) * 100);

        // 更新进度条和百分比
        this.updateProgress(progressPercent);

        // 更新普通/超级图标显示
        this._arrIconN.forEach(node => {
            if (TSUtility.isValid(node)) node.active = !this._isSuperMission;
        });
        this._arrIconR.forEach(node => {
            if (TSUtility.isValid(node)) node.active = this._isSuperMission;
        });

        // 更新红点显示（奖励领取计数）
        const receiveCount = this.getReceiveCount();
        this._arrRedDot.forEach(node => node.active = receiveCount > 0);
        this._arrRedDotCount.forEach(label => {
            label.string = receiveCount.toString();
        });

        // 首次完成所有任务标记
        if (HyperBountyManager.instance.isCompleteAllMissionIncludeSuper()) {
            this._isFirstCompleteAllMission = false;
        }

        // 处理赢取旋转任务UI
        if (TSUtility.isValid(this._infoMission)) {
            if (this._infoMission.numMissionID === HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_SPIN) {
                this._isSpinWinMission = true;
                this.spinCountNodes.forEach(node => node.active = true);
                this.spinCountLabels.forEach(label => {
                    label.string = `${CurrencyFormatHelper.formatNumber(
                        this._infoMission.numSubGoalCount - this._infoMission.numSubCurrentCount
                    )}`;
                });

                // 任务失败提示（子任务计数从目标值-1变为0）
                if (this._isSpinWinMission && this._infoMission.numSubCurrentCount === 0 && this._prevSubCnt === this._infoMission.numSubGoalCount - 1) {
                    this.missionFailTooltipNode.active = true;
                    this.button.scheduleOnce(() => {
                        this.missionFailTooltipNode.active = false;
                    }, 3);
                }
            } else {
                this._isSpinWinMission = false;
                this._prevSubCnt = 0;
                this.spinCountNodes.forEach(node => node.active = false);
            }
        } else {
            this._isSpinWinMission = false;
            this._prevSubCnt = 0;
        }

        // 更新倒计时（任务重置时间）
        this.updateRemainTime();
    }

    /**
     * 更新进度条显示（含特效动画）
     * @param percent 进度百分比（0-100）
     */
    updateProgress(percent: number) {
        // 更新百分比文本
        this._arrPercent.forEach(label => {
            if (TSUtility.isValid(label)) {
                label.string = `${Math.floor(percent)}%`;
            }
        });

        // 更新进度条填充和特效
        this._arrProgress.forEach(sprite => {
            if (!TSUtility.isValid(sprite)) return;

            sprite.unscheduleAllCallbacks();
            sprite.fillRange = percent / 100;

            // 进度条特效处理
            const maskNode = sprite.node.getChildByName("Mask");
            const gaugeFXNode = maskNode?.getChildByName("Gauge_FX");
            const parentAniNode = sprite.node.parent.parent;

            if (TSUtility.isValid(maskNode) && TSUtility.isValid(gaugeFXNode)) {
                // 设置特效位置
                gaugeFXNode.setPosition(0, -0.5 * sprite.node.height + sprite.fillRange * sprite.node.height);

                // 进度变化时播放特效
                if (this._prevProgress !== percent) {
                    gaugeFXNode.active = false;
                    gaugeFXNode.opacity = 255;

                    const parentAni = parentAniNode.getComponent(cc.Animation);
                    if (parentAni) {
                        parentAni.stop("HB_Gauge_Effect");
                        parentAni.setCurrentTime(0);
                    }

                    gaugeFXNode.active = true;
                    parentAni?.play("HB_Gauge_Effect");
                }
            }
        });

        this._prevProgress = percent;
    }

    /**
     * 获取奖励可领取总数（日常+超级+赛季）
     * @returns 可领取奖励数
     */
    getReceiveCount(): number {
        let count = 0;
        count += HyperBountyManager.instance.numDailyReceiveCount;
        count += HyperBountyManager.instance.numSuperReceiveCount;
        count += HyperBountyManager.instance.numSeasonReceiveCount;
        return count;
    }

    /**
     * 获取当前任务信息（区分普通/超级任务）
     * @returns [是否为超级任务, 任务信息对象]
     */
    getMissionInfo(): [boolean, any] {
        this._numRunningMissionIndex = HyperBountyManager.instance.numDailyRunningMissionIndex;
        this._isSuperMissionReceive = HyperBountyManager.instance.numSuperReceiveCount > 0;

        // 无运行中任务且未领取超级任务 → 返回超级任务信息
        if (this._numRunningMissionIndex < 0 && !this._isSuperMissionReceive) {
            return [true, HyperBountyManager.instance.getSuperMissionInfo()];
        }

        // 无运行中任务但已领取超级任务 → 返回超级任务空信息
        if (this._numRunningMissionIndex < 0 && this._isSuperMissionReceive) {
            return [true, null];
        }

        // 有运行中任务 → 返回日常任务信息
        return [false, HyperBountyManager.instance.getDailyMissionByIndex(this._numRunningMissionIndex)];
    }

    /**
     * 更新任务剩余时间（倒计时，到点重置任务）
     */
    updateRemainTime() {
        this.unscheduleAllCallbacks();
        this._numNextResetDate = HyperBountyManager.instance.numDailyNextResetDate;
        this._numSuperNextResetDate = HyperBountyManager.instance.numSuperNextResetDate;

        // 倒计时检查逻辑
        const checkRemainTime = async () => {
            // 检查日常任务重置时间
            if (this._numNextResetDate - TSUtility.getServerBaseNowUnixTime() <= 0) {
                this.unscheduleAllCallbacks();
                // PopupManager.Instance().showDisplayProgress(true);

                // try {
                //     const res = await CommonServer.Instance().asyncRequestAcceptPromotion(
                //         UserInfo.instance().getUid(),
                //         UserInfo.instance().getAccessToken(),
                //         HyperBountyDailyNormalPromotionInfo.PromotionKeyName,
                //         0,
                //         0,
                //         ""
                //     );
                //     if (!CommonServer.isServerResponseError(res)) {
                //         UserInfo.instance().applyChangeResult(UserInfo.instance().getServerChangeResult(res));
                //     }
                //     await this.playNormalRemainTimeAction();
                // } catch (error) {
                //     console.error("Daily mission reset error:", error);
                // } finally {
                //     PopupManager.Instance().showDisplayProgress(false);
                // }
            }

            // 检查超级任务重置时间
            if (this._numSuperNextResetDate - TSUtility.getServerBaseNowUnixTime() <= 0) {
                if (this._isSuperMission) return;

                this._numSuperNextResetDate = HyperBountyManager.instance.numSuperNextResetDate;
                this.unscheduleAllCallbacks();
                // PopupManager.Instance().showDisplayProgress(true);

                // try {
                //     const res = await CommonServer.Instance().asyncRequestAcceptPromotion(
                //         UserInfo.instance().getUid(),
                //         UserInfo.instance().getAccessToken(),
                //         HyperBountyDailyNormalPromotionInfo.PromotionKeyName,
                //         0,
                //         0,
                //         ""
                //     );
                //     if (!CommonServer.isServerResponseError(res)) {
                //         UserInfo.instance().applyChangeResult(UserInfo.instance().getServerChangeResult(res));
                //     }
                //     await this.playSuperRemainTimeAction();
                // } catch (error) {
                //     console.error("Super mission reset error:", error);
                // } finally {
                //     PopupManager.Instance().showDisplayProgress(false);
                // }
            }
        };

        // 立即执行一次，然后每秒轮询
        this.unschedule(checkRemainTime);
        checkRemainTime();
        this.schedule(checkRemainTime, 1);
    }

    /**
     * 播放普通任务完成动画 + 提示
     */
    async playCompleteMissionAction() {
        // 更新进度为100%
        this.updateProgress(100);

        // 配置完成提示框
        this.lblTooltip_1.node.active = false;
        this.lblTooltip_2.overflow = cc.Label.Overflow.NONE;
        this.lblTooltip_2.string = `Mission ${(this._numRunningMissionIndex + 1).toString()} completed!`;
        
        const tipBoxNode = this.nodeTooltip.getChildByName("Tip-100_Tip_Box");
        tipBoxNode.width = 310;
        const tipBoxLayout = tipBoxNode.getComponent(cc.Layout);
        tipBoxLayout.paddingBottom = 30;
        tipBoxLayout.paddingTop = 30;

        // 显示提示框并播放动画
        this.nodeTooltip.active = true;
        this.nodeTooltip.stopAllActions();
        this.nodeTooltip.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(3),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.nodeTooltip.active = false;
            })
        ));

        // 播放完成特效动画
        this.anim.node.active = true;
        this.anim.setCurrentTime(0);
        this.anim.play(this.ANIMATION_NAME, 0);

        // 延迟后更新UI
        await AsyncHelper.delayWithComponent(3, this);
        this.updateMissionUI();
        await AsyncHelper.delayWithComponent(0.5, this);

        // 恢复提示框样式并显示任务信息
        tipBoxLayout.paddingBottom = 20;
        tipBoxLayout.paddingTop = 20;
        this.anim.node.active = false;

        if (TSUtility.isValid(this._infoMission)) {
            this.lblTooltip_1.node.active = true;
            this.lblTooltip_1.string = this._isSuperMission 
                ? "SUPER MISSION" 
                : `MISSION ${(this._numRunningMissionIndex + 1).toString()}`;
            this.lblTooltip_2.string = HyperBountyManager.instance.getMissionDescription(this._infoMission, false);
            tipBoxNode.width = this.lblTooltip_2.node.width + 60;

            this.nodeTooltip.active = true;
            this.nodeTooltip.stopAllActions();
            this.nodeTooltip.runAction(cc.sequence(
                cc.fadeIn(0.2),
                cc.delayTime(3),
                cc.fadeOut(0.2),
                cc.callFunc(() => {
                    this.nodeTooltip.active = false;
                })
            ));
        }
    }

    /**
     * 播放超级任务完成动画 + 提示
     * @param isSkipProgress 是否跳过100%进度更新
     */
    async playCompleteMissionAction_Super(isSkipProgress: boolean = false) {
        // 更新进度为100%（非跳过状态）
        if (!isSkipProgress) {
            this.updateProgress(100);
        }

        // 配置超级任务完成提示框
        this.lblTooltip_1.node.active = false;
        this.lblTooltip_2.overflow = cc.Label.Overflow.NONE;
        this.lblTooltip_2.string = "Super Mission completed!";
        
        const tipBoxNode = this.nodeTooltip.getChildByName("Tip-100_Tip_Box");
        tipBoxNode.width = 360;
        const tipBoxLayout = tipBoxNode.getComponent(cc.Layout);
        tipBoxLayout.paddingBottom = 30;
        tipBoxLayout.paddingTop = 30;

        // 显示提示框并播放动画
        this.nodeTooltip.active = true;
        this.nodeTooltip.stopAllActions();
        this.nodeTooltip.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(3),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.nodeTooltip.active = false;
            })
        ));

        // 播放完成特效动画
        this.anim.node.active = true;
        this.anim.setCurrentTime(0);
        this.anim.play(this.ANIMATION_NAME, 0);

        // 延迟后更新UI
        await AsyncHelper.delayWithComponent(3, this);
        this.updateMissionUI();
        await AsyncHelper.delayWithComponent(0.5, this);

        // 恢复提示框样式
        tipBoxLayout.paddingBottom = 20;
        tipBoxLayout.paddingTop = 20;
        this.anim.node.active = false;

        // 非超级任务且非跳过状态时，显示任务信息提示
        if (TSUtility.isValid(this._infoMission) && !this._isSuperMission && !isSkipProgress) {
            this.lblTooltip_1.node.active = true;
            this.lblTooltip_1.string = `MISSION ${(this._numRunningMissionIndex + 1).toString()}`;
            this.lblTooltip_2.string = HyperBountyManager.instance.getMissionDescription(this._infoMission, false);
            tipBoxNode.width = this.lblTooltip_2.node.width + 60;

            this.nodeTooltip.active = true;
            this.nodeTooltip.stopAllActions();
            this.nodeTooltip.runAction(cc.sequence(
                cc.fadeIn(0.2),
                cc.delayTime(3),
                cc.fadeOut(0.2),
                cc.callFunc(() => {
                    this.nodeTooltip.active = false;
                })
            ));
        }
    }

    /**
     * 播放日常任务重置提示动画
     */
    async playNormalRemainTimeAction() {
        this.nodeTooltip.active = true;
        this.lblTooltip_1.node.active = false;
        this.lblTooltip_2.string = "New Day, New Bounties!\nDaily Bounties have reset!";
        
        this.nodeTooltip.stopAllActions();
        this.nodeTooltip.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(3),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.nodeTooltip.active = false;
            })
        ));

        this.updateMissionUI();
    }

    /**
     * 播放超级任务重置提示动画
     */
    async playSuperRemainTimeAction() {
        this.nodeTooltip.active = true;
        this.lblTooltip_1.node.active = false;
        this.lblTooltip_2.string = "Super Bounty has reset!\nNew bounty has been assigned.";
        
        this.nodeTooltip.stopAllActions();
        this.nodeTooltip.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(3),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.nodeTooltip.active = false;
            })
        ));

        this.updateMissionUI();
    }

    /**
     * 按钮点击回调（打开HyperBounty弹窗/显示即将上线提示）
     */
    onClick() {
        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // HyperBounty未启动时显示即将上线提示
        if (!HyperBountyManager.instance.isHyperBountyStart()) {
            this.setShowCommingSoonTooltip();
            if (this.nodeCommingSoon.active) {
                this.scheduleOnce(this.setShowCommingSoonTooltip, 3);
            } else {
                this.unschedule(this.setShowCommingSoonTooltip);
            }
            return;
        }

        // 显示遮罩并打开HyperBounty弹窗
        PopupManager.Instance().showBlockingBG(true);

        const openPopupInfo = new OpenPopupInfo();
        openPopupInfo.type = "HyperBoutnyIngame";
        openPopupInfo.openCallback = () => {
            HyperBountyManager.instance.openHyperBountyPopup(new HyperBountyPopupOpenInfo(
                HyperBountyUIType.DAILY,
                {
                    funcOpen: () => {
                        PopupManager.Instance().showBlockingBG(false);
                    },
                    funcClose: () => {
                        this.updateMissionUI();
                        ServiceInfoManager.BOOL_IS_OPENING_HYPER_BOUNTY_UI = false;
                        PopupManager.Instance().checkNextOpenPopup();
                    }
                }
            ));
        };

        // 根据等级UI状态优先级添加弹窗
        if (ServiceInfoManager.BOOL_IS_OPENING_LEVEL_UP_UI) {
            PopupManager.Instance().addOpenPopup_Prior(openPopupInfo);
        } else {
            PopupManager.Instance().addOpenPopup(openPopupInfo);
        }
        ServiceInfoManager.BOOL_IS_OPENING_HYPER_BOUNTY_UI = true;
    }

    /**
     * 切换“即将上线”提示显示状态
     */
    setShowCommingSoonTooltip() {
        this.nodeCommingSoon.active = !this.nodeCommingSoon.active;
    }
}