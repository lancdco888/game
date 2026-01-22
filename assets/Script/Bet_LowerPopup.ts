import FireHoseSender, { FHLogType } from "./FireHoseSender";
import GameCommonSound from "./GameCommonSound";
import HRVSlotService from "./HRVService/HRVSlotService";
import CommonPopup from "./Popup/CommonPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import PopupManager from "./manager/PopupManager";
import SlotManager from "./manager/SlotManager";

const { ccclass, property } = cc._decorator;



/**
 * 低投注引导（Bet_Lower）弹窗组件
 * 负责低投注弹窗的动态加载（普通/锦标赛版）、显示动画、按钮交互、大厅跳转等核心逻辑
 */
@ccclass()
export default class Bet_LowerPopup extends cc.Component {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Button, displayName: '取消按钮' })
    cancleBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: '确认按钮' })
    okBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: '关闭按钮' })
    closeBtn: cc.Button = null;

    @property({ type: cc.Label, displayName: '区域名称标签' })
    roller_Name_Label: cc.Label = null;

    @property({ type: cc.Label, displayName: '停留标签' })
    stay_Label: cc.Label = null;

    @property({ type: cc.Label, displayName: '跳转标签' })
    move_Label: cc.Label = null;

    @property({ type: cc.Label, displayName: '锦标赛层级标签' })
    tier_Label: cc.Label = null;

    // === 私有静态属性 ===
    private static _currentBetLowerOpenPopup: Bet_LowerPopup = null; // 当前打开的低投注弹窗实例

    // === 私有状态属性 ===
    private _zoneId: number = 0;          // 目标区域ID
    private _zoneName: string = SDefine.HIGHROLLER_ZONENAME; // 目标区域名称
    private _closed: boolean = false;     // 是否已关闭

    /**
     * 静态方法：加载低投注弹窗预制体（区分普通/锦标赛版）
     * @param callback 回调函数 (error: Error | null, popup: Bet_LowerPopup | null)
     */
    static getBetLowerPopup(callback?: (error: Error | null, popup: Bet_LowerPopup | null) => void): void {
        // 确定预制体路径：锦标赛模式用Tourney版，否则用普通版
        let resPath = "Popup/Prefab/Slot/Bet_LowerPopup_1";
        if (SDefine.SlotTournament_Use && UserInfo.instance().isJoinTourney()) {
            resPath = "Popup/Prefab/Slot/Bet_LowerPopup_Tourney";
        }

        // 加载弹窗预制体资源
        cc.loader.loadRes(resPath, (loadError: Error | null, prefab: any) => {
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
                const popupComp = popupNode.getComponent(Bet_LowerPopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    /**
     * 静态方法：打开低投注弹窗（封装加载 + 显示逻辑）
     * @param zoneId 区域ID（非0时生效）
     * @param zoneName 区域名称
     * @param targetNode 目标节点（用于计算弹窗位置）
     */
    static openBetLowerkPopup(zoneId: number, zoneName: string, targetNode: cc.Node): void {
        // 区域ID非0时才打开弹窗
        if (zoneId === 0) return;

        // 校验当前弹窗实例是否有效，无效则加载新弹窗
        if (!this._currentBetLowerOpenPopup || !TSUtility.isValid(this._currentBetLowerOpenPopup)) {
            PopupManager.Instance().showDisplayProgress(true);
            
            this.getBetLowerPopup((error, popup) => {
                PopupManager.Instance().showDisplayProgress(false);
                
                if (error) {
                    cc.error("Bet_LowerPopup.getPopup fail.");
                    return;
                }

                if (popup) {
                    popup.open(zoneId, zoneName, targetNode);
                }
            });
        }
    }

    onLoad() {
        // 绑定取消按钮点击事件
        if (this.cancleBtn) {
            this.cancleBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "Bet_LowerPopup", "onClickClose", "")
            );
        }

        // 绑定确认按钮点击事件
        if (this.okBtn) {
            this.okBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "Bet_LowerPopup", "onClickOkBtn", "")
            );
        }

        // 绑定关闭按钮点击事件
        if (this.closeBtn) {
            this.closeBtn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "Bet_LowerPopup", "onClickClose", "")
            );
        }
    }

    /**
     * 打开弹窗（核心方法：初始化数据、设置位置、更新UI、播放动画）
     * @param zoneId 区域ID
     * @param zoneName 区域名称
     * @param targetNode 目标节点（用于计算弹窗位置）
     */
    open(zoneId: number, zoneName: string, targetNode: cc.Node): void {
        // 记录当前弹窗实例
        (this.constructor as typeof Bet_LowerPopup)._currentBetLowerOpenPopup = this;

        // 添加全局触摸监听和Tooltip监听
        SlotManager.Instance.addEventListener(cc.Node.EventType.TOUCH_START, this.onClickClose.bind(this));
        SlotManager.Instance.addSlotTooltip(SlotManager.Instance.TOOLTIP_MINIMUM_BET, this.onClickClose.bind(this));
        SlotManager.Instance.checkSlotTooltip(SlotManager.Instance.TOOLTIP_MINIMUM_BET);

        // 播放弹窗打开音效
        GameCommonSound.playFxOnce("pop_etc");

        // 初始化区域数据
        this._zoneId = zoneId - 1;
        this._zoneName = zoneName;

        // 将弹窗挂载到游戏UI的弹窗根节点
        const hrvSlotService = HRVSlotService.instance();
        if (hrvSlotService && hrvSlotService.getInGameUI()) {
            hrvSlotService.getInGameUI().getPopupRootNode().addChild(this.node);
        }

        // 计算弹窗位置（目标节点世界坐标转父节点本地坐标 + 偏移）
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.node.parent.convertToNodeSpaceAR(worldPos);
        this.node.active = true;
        this.node.setPosition(localPos.x + 20, localPos.y + 70);

        // 刷新UI（设置自动关闭定时器）
        this.refreshUI();

        // 初始化弹窗显示状态（半透明 + 缩放到0）
        this.node.opacity = 50;
        this.node.setScale(0, 0);

        // 设置锦标赛层级标签（仅锦标赛模式生效）
        if (this.tier_Label) {
            let tierText = "GREEN";
            switch (UserInfo.instance().getTourneyTier()) {
                case 0:
                    tierText = "GREEN";
                    break;
                case 1:
                    tierText = "ELITE";
                    break;
                case 2:
                    tierText = "PREMIER";
                    break;
            }
            this.tier_Label.string = tierText;
        }

        // 设置区域名称相关标签
        let zoneDisplayName = "";
        if (zoneName === SDefine.SUITE_ZONENAME) {
            zoneDisplayName = "HIGH Zone";
        } else if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
            zoneDisplayName = "REGULAR Zone";
        }

        if (this.roller_Name_Label) {
            this.roller_Name_Label.string = `${zoneDisplayName}.`;
        }
        if (this.stay_Label) {
            this.stay_Label.string = `STAY IN ${zoneDisplayName}`;
        }
        if (this.move_Label) {
            this.move_Label.string = `GO TO ${zoneDisplayName}`;
        }

        // 非锦标赛模式：隐藏确认/取消按钮，显示关闭按钮
        if (!SDefine.SlotTournament_Use || !UserInfo.instance().isJoinTourney()) {
            if (TSUtility.isValid(this.cancleBtn)) {
                this.cancleBtn.node.active = false;
            }
            if (TSUtility.isValid(this.okBtn)) {
                this.okBtn.node.active = false;
            }
            if (TSUtility.isValid(this.closeBtn)) {
                this.closeBtn.node.active = true;
            }
        }

        // 播放弹窗展开动画（淡入 + 缩放回弹）
        this.scheduleOnce(() => {
            const openAction = cc.spawn(
                cc.fadeIn(0.2),
                cc.scaleTo(0.25, 1, 1).easing(cc.easeBackOut())
            );
            this.node.runAction(openAction);
        }, 0.01);
    }

    /**
     * 关闭按钮点击回调（播放音效 + 关闭弹窗）
     */
    onClickClose(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    /**
     * 关闭弹窗（移除监听 + 播放动画 + 销毁节点 + 清理状态）
     */
    close(): void {
        // 已关闭则直接返回
        if (this._closed) return;
        this._closed = true;

        // 移除全局触摸监听和Tooltip监听
        SlotManager.Instance.removeEventListener(cc.Node.EventType.TOUCH_START, this.onClickClose.bind(this));
        SlotManager.Instance.removeSlotTooltip(SlotManager.Instance.TOOLTIP_MINIMUM_BET);

        // 取消所有定时器
        this.unscheduleAllCallbacks();
        
        // 清空当前弹窗实例记录
        (this.constructor as typeof Bet_LowerPopup)._currentBetLowerOpenPopup = null;

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
     * 刷新UI（设置4秒后自动关闭弹窗）
     */
    refreshUI(): void {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(this.close.bind(this), 4);
    }

    /**
     * 确认按钮点击回调（播放音效 + 关闭弹窗 + 处理大厅跳转逻辑）
     */
    onClickOkBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();

        // 处理SneakPeekSlot且目标为VIP_LOUNGE区域的特殊逻辑
        const isSneakPeek = ServiceInfoManager.instance.isSneakPeekSlot(UserInfo.instance().getGameId());
        const isVIPLoungeZone = this._zoneId + 1 === SDefine.VIP_LOUNGE_ZONEID;
        
        if (isSneakPeek && isVIPLoungeZone) {
            // 正在旋转中：弹出确认弹窗
            if (SlotManager.Instance.isSpinState()) {
                CommonPopup.getPopup("TypeB", (error, popup) => {
                    if (popup) {
                        popup.open()
                            .setOkBtn("YES", () => {
                                this.goToLobby();
                            })
                            .setCancelBtn("NO", () => {})
                            .setInfo(
                                "Spin in progress.\nAre you sure you want to leave?",
                                "* The spin result will apply to your \nbalance automatically"
                            );
                    }
                });
            } 
            // 未旋转：直接跳转大厅
            else {
                this.goToLobby();
            }
            return;
        }

        // 普通逻辑：跳转到指定区域大厅
        SlotManager.Instance.goToLobby(this._zoneId, this._zoneName);
    }

    /**
     * 跳转至高 Roller 大厅（兜底逻辑）
     */
    goToLobby(): void {
        SlotManager.Instance.goToLobby(SDefine.HIGHROLLER_ZONEID, SDefine.HIGHROLLER_ZONENAME);
    }
}