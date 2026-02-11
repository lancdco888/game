import LevelBettingLockConfig from "./Config/LevelBettingLockConfig";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import GameCommonSound from "./GameCommonSound";
import HRVSlotService from "./HRVService/HRVSlotService";
import ServiceInfoManager from "./ServiceInfoManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import PopupManager from "./manager/PopupManager";
import SlotGameRuleManager from "./manager/SlotGameRuleManager";
import SlotManager from "./manager/SlotManager";

const { ccclass, property } = cc._decorator;
/**
 * 投注引导弹窗状态枚举
 */
export enum BetGuideState {
    MAXBET = "MAXBET",             // 最大投注
    LEVELLOCK_MOVE = "LEVELLOCK_MOVE", // 等级锁定移动
    LEVELLOCK = "LEVELLOCK",       // 等级锁定
    MAXBET_CHECK = "M_CHECK",      // 最大投注检查
    MAXBET_GO = "M_GO"             // 最大投注确认
}

/**
 * 投注引导（BetGuide）弹窗组件
 * 负责投注引导弹窗的动态加载、位置计算、动画播放、按钮交互、大厅跳转等核心逻辑
 */
@ccclass()
export default class BetGuidePopup extends cc.Component {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Button, displayName: '跳转按钮' })
    moveButton: cc.Button = null;

    @property({ type: cc.Button, displayName: '关闭按钮' })
    closeButton: cc.Button = null;

    @property({ type: cc.Label, displayName: '开启等级标签' })
    openLevel_Label: cc.Label = null;

    // === 私有静态属性 ===
    private static _currentBetGuideOpenPopup: BetGuidePopup = null; // 当前打开的投注引导弹窗实例

    // === 私有状态属性 ===
    private _targetZone: number = 0; // 目标区域ID
    private _betMoney: number = 0;   // 投注金额
    private _closed: boolean = false; // 是否已关闭

    /**
     * 静态方法：加载指定类型的投注引导弹窗预制体
     * @param popupType 弹窗类型（拼接预制体路径）
     * @param callback 回调函数 (error: Error | null, popup: BetGuidePopup | null)
     */
    static getPopup(popupType: string, callback?: (error: Error | null, popup: BetGuidePopup | null) => void): void {
        const resPath = `Popup/Prefab/Slot/BetGuidePopup_${popupType}`;

        // 加载弹窗预制体资源
        cc. loader.loadRes(resPath, (loadError: Error | null, prefab: any) => {
            // 资源加载失败：上报异常日志 + 执行回调
            if (loadError) {
                const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(loadError)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg));
                
                if (callback) {
                    callback(loadError, null);
                }
                return;
            }

            // 资源加载成功：实例化预制体并返回组件
            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(BetGuidePopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    /**
     * 静态方法：打开投注引导弹窗（封装加载 + 显示逻辑）
     * @param popupType 弹窗类型
     * @param targetZone 目标区域ID
     * @param targetNode 目标节点（用于计算弹窗位置）
     * @param betMoney 投注金额
     */
    static openBetGuidePopup(popupType: string, targetZone: number, targetNode: cc.Node, betMoney: number): void {
        // 校验当前弹窗实例是否有效，无效则打开新弹窗
        if (!this._currentBetGuideOpenPopup || !TSUtility.isValid(this._currentBetGuideOpenPopup)) {
            PopupManager.Instance().showDisplayProgress(true);
            
            this.getPopup(popupType, (error, popup) => {
                PopupManager.Instance().showDisplayProgress(false);
                
                if (error) {
                    cc.error("BetGuidePopup.getPopup fail.");
                    return;
                }

                if (popup) {
                    popup.open(popupType, targetZone, targetNode, betMoney);
                }
            });
        } else {
            // 当前弹窗有效则关闭
            this._currentBetGuideOpenPopup.close();
        }
    }

    onLoad() {
        // 绑定关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "BetGuidePopup", "onClickClose", "")
            );
        }

        // 绑定跳转按钮点击事件
        if (this.moveButton) {
            this.moveButton.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "BetGuidePopup", "onClickMoveButton", "")
            );
        }
    }

    /**
     * 打开弹窗（核心方法：设置位置、播放动画、自动关闭、初始化数据）
     * @param popupType 弹窗类型（影响位置偏移）
     * @param targetZone 目标区域ID
     * @param targetNode 目标节点（用于计算弹窗位置）
     * @param betMoney 投注金额
     */
    open(popupType: string, targetZone: number, targetNode: cc.Node, betMoney: number): void {
        // 播放弹窗打开音效
        GameCommonSound.playFxOnce("pop_etc");
        
        // 记录当前弹窗实例
        (this.constructor as typeof BetGuidePopup)._currentBetGuideOpenPopup = this;

        // 将弹窗挂载到游戏UI的弹窗根节点
        const hrvSlotService = HRVSlotService.instance();
        if (hrvSlotService && hrvSlotService.getInGameUI()) {
            hrvSlotService.getInGameUI().getPopupRootNode().addChild(this.node);
        }

        // 初始化数据
        this._betMoney = betMoney;
        this._targetZone = targetZone;

        // 计算弹窗位置（目标节点世界坐标转父节点本地坐标）
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.node.parent.convertToNodeSpaceAR(worldPos);
        
        // 根据弹窗类型设置位置偏移
        if (popupType === BetGuideState.MAXBET) {
            this.node.setPosition(localPos.x + 20, localPos.y + 70);
        } else {
            this.node.setPosition(localPos.x + 50, localPos.y + 100);
        }

        // 初始化弹窗显示状态（半透明 + 缩放到0）
        this.node.active = true;
        this.node.opacity = 50;
        this.node.setScale(0, 0);

        // 设置开启等级标签文本
        if (this.openLevel_Label) {
            this.setOpenLevel();
        }

        // 播放弹窗展开动画（淡入 + 缩放回弹）
        this.scheduleOnce(() => {
            const openAction = cc.spawn(
                cc.fadeIn(0.2),
                cc.scaleTo(0.25, 1, 1).easing(cc.easeBackOut())
            );
            this.node.runAction(openAction);
        }, 0.01);

        // 4秒后自动关闭弹窗
        this.scheduleOnce(this.close.bind(this), 4);
    }

    /**
     * 设置开启等级标签文本（根据投注金额计算下一个可用等级）
     */
    setOpenLevel(): void {
        if (!this.openLevel_Label) return;

        // 获取当前区域的下一个可用等级
        const zoneId = SlotManager.Instance.getZoneId();
        const nextLevel = LevelBettingLockConfig.Instance().getZoneInfo(zoneId).getNextAvailable_Level(this._betMoney);
        
        // 设置标签文本
        this.openLevel_Label.string = `AT LEVEL ${nextLevel.toString()}`;
    }

    /**
     * 关闭按钮点击回调（播放音效 + 关闭弹窗）
     */
    onClickClose(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    /**
     * 关闭弹窗（播放关闭动画 + 销毁节点 + 清理状态）
     */
    close(): void {
        // 已关闭则直接返回
        if (this._closed) return;
        this._closed = true;

        // 取消所有定时器
        this.unscheduleAllCallbacks();
        
        // 清空当前弹窗实例记录
        (this.constructor as typeof BetGuidePopup)._currentBetGuideOpenPopup = null;

        // 播放关闭动画（淡出 + 缩小），完成后销毁节点
        const closeAction = cc.sequence(
            cc.spawn(
                cc.fadeOut(0.15),
                cc.scaleTo(0.15, 0, 0).easing(cc.easeIn(1))
            ),
            cc.callFunc(() => {
                this.node.removeFromParent();
                this.node.destroy();
            })
        );
        this.node.runAction(closeAction);
    }

    /**
     * 跳转按钮点击回调（跳转到指定大厅 + 埋点上报）
     */
    onClickMoveButton(): void {
        // 计算目标大厅类型（1=VIP_LOUNGE，2=SUITE）
        const targetLobbyType = this._targetZone + 1;
        let lobbyName = "";
        
        if (targetLobbyType === 1) {
            lobbyName = SDefine.VIP_LOUNGE_ZONENAME;
        } else if (targetLobbyType === 2) {
            lobbyName = SDefine.SUITE_ZONENAME;
        }

        // 记录要切换的SLOT ID
        ServiceInfoManager.STRING_SWITCH_TO_HIGH_SLOT_ID = SlotGameRuleManager.Instance.slotID;
        
        // 跳转到指定大厅
        SlotManager.Instance.goToLobby(targetLobbyType, lobbyName);
        
        // 上报埋点（进入赌场，原因：betting）
        //Analytics.default.enterCasino(targetLobbyType, "betting");
    }
}