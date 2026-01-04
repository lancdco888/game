const { ccclass } = cc._decorator;

import AsyncHelper from "../global_utility/AsyncHelper";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
// import JackpotInfoNotiPopup from "../../../Popup/CasinoJackpot/JackpotInfoNotiPopup";
import SlotJackpotManager from "../manager/SlotJackpotManager";
import UserInfo from "../User/UserInfo";
import { NotifyType } from "../Notify/NotifyManager";
import NotifyActionBase from "./NotifyActionBase";


/** 赌场大奖中奖 通知处理类 - 继承通知基类 */
@ccclass
export default class NotifyAction_CasinoJackpotWin extends NotifyActionBase {
    /** 弹窗有效时限 60秒 */
    public LIMIT_TIME: number = 60;

    constructor(){
        super()
    }

    /** 获取当前通知处理类对应的类型 */
    public getType(): string|number {
        return NotifyType.CASINO_JACKPOT_WIN;
    }

    /** 追加数据前的预处理逻辑 */
    public beforeAppend(data: any): void {
        const infoBase = data.infoBase;
        if (!TSUtility.isValid(infoBase)) return;
        if (TSUtility.isValid(infoBase.info) && infoBase.info.zoneID === 0) return;
        // 设置赌场最新中奖信息
        SlotJackpotManager.Instance().setCasinoLastWinInfo(infoBase.info.zoneID, infoBase.info);
    }

    /** 核心执行通知的业务逻辑 */
    public action(data: any): void {
        const infoBase = data.infoBase;
        // 基础数据校验失败 直接完成
        if (!TSUtility.isValid(infoBase)) {
            this.done();
            return;
        }
        // 中奖信息/分区ID无效 直接完成
        if (TSUtility.isValid(infoBase.info) && infoBase.info.zoneID === 0) {
            this.done();
            return;
        }
        // 当前用户是中奖人 不处理弹窗
        if (infoBase.info.user.uid === UserInfo.instance().getUid()) {
            this.done();
            return;
        }
        // 通知过期(超过60秒) 直接完成
        if (infoBase.numIssueDate + this.LIMIT_TIME <= TSUtility.getServerBaseNowUnixTime()) {
            this.done();
            return;
        }
        // 分区ID不匹配 直接完成
        if (infoBase.info.zoneID !== UserInfo.instance().getZoneId()) {
            this.done();
            return;
        }

        // 大厅场景 - 执行大厅弹窗逻辑
        if (this.isValidLobbyScene() === 1) {
            this.playAction_Lobby(infoBase)
                .then(() => { this.done(); });
        }
        // 游戏内场景 - 执行游戏内弹窗逻辑
        else if (this.isValidSlotScene() === 1) {
            this.playAction_Slot(infoBase)
                .then(() => { this.done(); });
        }
        // 无效场景 直接完成
        else {
            this.done();
        }
    }

    /** 大厅场景下的弹窗执行逻辑 - 异步方法 */
    public async playAction_Lobby(infoBase: any): Promise<void> {
        if (this.isValidLobbyScene() === 0) return;
        // 显示遮罩层
        PopupManager.Instance().showBlockingBG(true);
        
        // 获取大厅的JackpotUI节点
        const jackpotUI = this.lobbyUI.getLobbyUI(LobbyUIType.JACKPOT);
        // 移动节点到父容器
        TSUtility.moveToNewParent(jackpotUI.lobbyJackpotTitle.node, this.lobbyUI.node);
        // 设置中奖金额并触发特效
        jackpotUI.lobbyJackpotTitle.setJackpotMoneyWithTrigger(infoBase.info.totalPrize);

        // 延时 4.44秒
        await AsyncHelper.delayWithComponent(4.44, this);

        // 打开中奖通知弹窗
        return new Promise<void>((resolve) => {
            // JackpotInfoNotiPopup.getPopup(true, (isExist: number, popup: JackpotInfoNotiPopup) => {
            //     // 隐藏遮罩层
            //     PopupManager.Instance().showBlockingBG(false);
            //     // 场景有效+弹窗未打开 执行弹窗逻辑
            //     if (this.isValidLobbyScene() !== 0 && !TSUtility.isValid(isExist)) {
            //         popup.open(infoBase, this.lobbyUI.node);
            //         // 重置赌场大奖状态
            //         UserInfo.instance().resetCasinoJackpot(infoBase.info.zoneID);
            //         // 弹窗关闭回调
            //         popup.setCloseCallback(() => {
            //             if (this.isValidLobbyScene() !== 0) {
            //                 // 重置标题金额动画
            //                 jackpotUI.lobbyJackpotTitle.restartMoneyUpdate();
            //                 jackpotUI.lobbyJackpotTitle.setActivePassNode(true);
            //                 jackpotUI.lobbyJackpotTitle.initLobbyTitleEffectSelector(true);
            //                 // 节点归位
            //                 TSUtility.moveToNewParent(jackpotUI.lobbyJackpotTitle.node, jackpotUI.nodeJackpotRoot);
            //             }
            //             resolve();
            //         });
            //     } else {
            //         resolve();
            //     }
            // });
        });
    }

    /** 游戏内场景下的弹窗执行逻辑 - 异步方法 */
    public async playAction_Slot(infoBase: any): Promise<void> {
        if (this.isValidSlotScene() === 0) return;
        // 显示遮罩层
        PopupManager.Instance().showBlockingBG(true);
        
        // 延时 1.4秒
        await AsyncHelper.delayWithComponent(1.4, this);

        // 打开中奖通知弹窗
        return new Promise<void>((resolve) => {
            // JackpotInfoNotiPopup.getPopup(false, (isExist: number, popup: JackpotInfoNotiPopup) => {
            //     // 隐藏遮罩层
            //     PopupManager.Instance().showBlockingBG(false);
            //     // 场景有效+弹窗未打开 执行弹窗逻辑
            //     if (this.isValidSlotScene() !== 0 && !TSUtility.isValid(isExist)) {
            //         popup.open(infoBase, this.inGameUI.node);
            //         // 重置赌场大奖状态
            //         UserInfo.instance().resetCasinoJackpot(infoBase.info.zoneID);
            //         // 弹窗关闭回调
            //         popup.setCloseCallback(() => { resolve(); });
            //     } else {
            //         resolve();
            //     }
            // });
        });
    }
}
