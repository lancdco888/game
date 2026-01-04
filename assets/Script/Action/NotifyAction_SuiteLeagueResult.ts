import SDefine from '../global_utility/SDefine';
import TSUtility from '../global_utility/TSUtility';
import PopupManager from '../manager/PopupManager';
import RewardCenterPopup from '../Popup/RewardCenterPopup';
import { RewardCenterViewType } from '../View/RewardCenterView';
import SuiteLeagueResultPopup from '../Popup/SuiteLeagueResultPopup';
import CenturionCliqueInvitePopup from '../Popup/CenturionCliqueInvitePopup';
import CenturionCliqueManager from '../manager/CenturionCliqueManager';
import SuiteLeagueManager from '../ServiceInfo/SuiteLeagueManager';
import UserInfo from '../User/UserInfo';
import { NotifyType } from '../Notify/NotifyManager';
import NotifyActionBase from './NotifyActionBase';

const { ccclass } = cc._decorator;

@ccclass
export default class NotifyAction_SuiteLeagueResult extends NotifyActionBase {
    /**
     * 获取当前通知的类型
     */
    public getType(): number|string {
        return NotifyType.SUITE_LEAGUE_REWARD;
    }

    /**
     * 通知行为的主入口方法
     * @param data 通知数据体
     */
    public action(data: { infoBase: any }): void {
        const infoBase = data.infoBase;
        // 校验数据有效性 + 场景有效性判断：非大厅场景、当前是套装联赛区、老虎机场景有效
        if (TSUtility.isValid(infoBase) 
            && this.isLobbyScene() !== 1 
            && UserInfo.instance().getZoneName() === SDefine.SUITE_ZONENAME 
            && this.isValidSlotScene() === 1) {
            this.playAction_Slot(infoBase).then(() => {
                this.done();
            });
        } else {
            this.done();
        }
    }

    /**
     * 老虎机场景下的套装联赛奖励弹窗逻辑
     * @param infoBase 基础通知数据
     */
    private async playAction_Slot(infoBase: any): Promise<void> {
        if (this.isValidSlotScene() === 0) return;
        
        // 显示遮罩层
        PopupManager.Instance().showBlockingBG(true);
        // 异步刷新收件箱信息
        await UserInfo.instance().asyncRefreshInboxInfo();
        // const userInboxInfo = UserInfo.instance().getUserInboxInfo();

        // // 判断是否需要展示套装联赛结果弹窗
        // if (!SuiteLeagueManager.instance().isShowResultNotify(userInboxInfo)) {
        //     PopupManager.Instance().showBlockingBG(false);
        //     return;
        // }

        return new Promise<void>((resolve) => {
            SuiteLeagueResultPopup.getPopup((err: any, popup: SuiteLeagueResultPopup) => {
                PopupManager.Instance().showBlockingBG(false);
                if (this.isValidSlotScene() === 0) {
                    this.done();
                    resolve();
                    return;
                }

                if (!TSUtility.isValid(err)) {
                    // const suiteLeagueResultInfo = SuiteLeagueManager.instance().getLatestSuiteLeagueResultInboxInfo(userInboxInfo);
                    // popup.open(suiteLeagueResultInfo);
                    // // 套装联赛结果弹窗关闭回调 - 链式执行后续弹窗逻辑
                    // popup.setCloseCallback(async () => {
                    //     await this.showCenturionCliqueInvitePopup();
                    //     await this.showInboxPopup(suiteLeagueResultInfo);
                    //     this.done();
                    //     resolve();
                    // });
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 展示百夫长帮派邀请弹窗逻辑
     */
    private async showCenturionCliqueInvitePopup(): Promise<void> {
        // const userInboxInfo = UserInfo.instance().getUserInboxInfo();
        // // 判断是否需要展示帮派邀请弹窗
        // if (!CenturionCliqueManager.Instance().isShowCenturionCliqueInvitePopup(userInboxInfo)) {
        //     return Promise.resolve();
        // }

        // return new Promise<void>((resolve) => {
        //     PopupManager.Instance().showBlockingBG(true);
        //     CenturionCliqueInvitePopup.getPopup((err: any, popup: CenturionCliqueInvitePopup) => {
        //         PopupManager.Instance().showBlockingBG(false);
        //         if (this.isValidSlotScene() === 0) {
        //             resolve();
        //             return;
        //         }

        //         if (!TSUtility.isValid(err)) {
        //             const cliqueRewardInfo = CenturionCliqueManager.Instance().getValidCenturionCliqueRewardInboxInfo(userInboxInfo);
        //             popup.openPopup(cliqueRewardInfo);
        //             popup.setCloseCallback(resolve);
        //         } else {
        //             resolve();
        //         }
        //     });
        // });
        return null;
    }

    /**
     * 展示收件箱奖励中心弹窗逻辑
     * @param inboxInfo 收件箱数据
     */
    private async showInboxPopup(inboxInfo: any): Promise<void> {
        // 解析额外信息，校验奖励数量有效性
        const extraInfo = JSON.parse(inboxInfo.message.extraInfo);
        const addCnt = TSUtility.isValid(extraInfo.addCnt) ? extraInfo.addCnt : 0;
        if (addCnt <= 0) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            PopupManager.Instance().showDisplayProgress(true);
            RewardCenterPopup.getPopup((err: any, popup: RewardCenterPopup) => {
                PopupManager.Instance().showDisplayProgress(false);
                // 场景有效且弹窗获取成功，打开收件箱页面
                if (this.isValidSlotScene() !== 0 && err === null) {
                    popup.open(RewardCenterViewType.INBOX_INBOX);
                    popup.setCloseCallback(resolve);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 原JS内置方法 - 判断是否是大厅场景
     */
    public isLobbyScene(): number {
        // 保留原逻辑的返回值规则 0=否 1=是
        return 0;
    }

    /**
     * 原JS内置方法 - 判断老虎机场景是否有效
     */
    public isValidSlotScene(): number {
        // 保留原逻辑的返回值规则 0=无效 1=有效
        return 1;
    }
}