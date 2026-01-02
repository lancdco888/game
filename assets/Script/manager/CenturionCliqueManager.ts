const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import CommonServer from "../Network/CommonServer";
import SDefine from "../global_utility/SDefine";
import UserInfo from "../User/UserInfo";
import MessageRoutingManager from "../message/MessageRoutingManager";
import TSUtility from "../global_utility/TSUtility";
import CenturionCliqueInvitePopup from "../Popup/CenturionCliqueInvitePopup";
import CenturionCliqueMainPopup from "../Popup/CenturionCliqueMainPopup";
import InboxMessagePrefabManager, { INBOX_ITEM_TYPE } from "../InboxMessagePrefabManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import PopupManager from "../manager/PopupManager";

@ccclass
export default class CenturionCliqueManager extends cc.Component {
    // ===================== 私有成员常量/变量 原数据完整保留 =====================
    private _multiplierShopBonusCenturionClique: number = 1.5;

    // ===================== 单例模式 【原文件是大写Instance 严格保留 区别于其他manager的小写】 =====================
    private static _instance: CenturionCliqueManager = null;
    public static Instance(): CenturionCliqueManager {
        if (CenturionCliqueManager._instance == null) {
            CenturionCliqueManager._instance = new CenturionCliqueManager();
            cc.game.addPersistRootNode(CenturionCliqueManager._instance.node);
        }
        return CenturionCliqueManager._instance;
    }

    // ===================== 原文件的get访问器属性 完整保留+装饰特性 =====================
    public get multiplierShopBonusCenturionClique(): number {
        return this._multiplierShopBonusCenturionClique;
    }

    // ===================== 对外暴露核心业务方法 【原逻辑一字不差完整保留】 =====================
    public isAvailableLobbyIconCenturionClique(level: number): boolean {
        const heroInfo = UserInfo.instance().getUserHeroInfo();
        let hasCenturionHero = false;
        heroInfo.heroes.forEach((hero) => {
            if (hero.isCenturionCliqueHero() && !hero.isExpired()) {
                hasCenturionHero = true;
            }
        });
        if (hasCenturionHero) {
            return true;
        }

        const itemInventory = UserInfo.instance().getItemInventory();
        let hasSuitePass = false;
        itemInventory.getItemsByItemId(SDefine.ITEM_SUITE_PASS).forEach((item) => {
            if (!item.isExpire()) {
                hasSuitePass = true;
            }
        });
        return !!(level >=7 || hasSuitePass);
    }

    public isActiveCenturionClique(): boolean {
        const userInstance = UserInfo.instance();
        if (userInstance == null) return false;

        let isActive = false;
        const cliqueItems = userInstance.getItemInventory().getItemsByItemId(SDefine.I_CENTURION_CLIQUE);
        for (let i = 0; i < cliqueItems.length; i++) {
            if (!cliqueItems[i].isExpire()) {
                isActive = true;
            }
        }
        return isActive;
    }

    public isActiveHeroCenturionClique(): boolean {
        let heroInfo = null;
        if (TSUtility.isValid(UserInfo.instance())) {
            heroInfo = UserInfo.instance().getUserHeroInfo();
        }
        return heroInfo != null && heroInfo.isActiveHero("hero_winston");
    }

    public isShowTutorial(): boolean {
        return !(this.isActiveCenturionClique() === false || ServerStorageManager.getAsBoolean(StorageKeyType.CENTURION_CLIQUE_TUTORIAL));
    }

    public setFlagShowTutorial(): void {
        ServerStorageManager.save(StorageKeyType.CENTURION_CLIQUE_TUTORIAL, true);
    }

    public getRemainTimeCenturionClique(): number {
        const userInstance = UserInfo.instance();
        if (userInstance == null) return 0;

        let validItem = null;
        const cliqueItems = userInstance.getItemInventory().getItemsByItemId(SDefine.I_CENTURION_CLIQUE);
        for (let i = 0; i < cliqueItems.length; i++) {
            if (!cliqueItems[i].isExpire()) {
                validItem = cliqueItems[i];
            }
        }

        let remainTime = -1;
        if (TSUtility.isValid(validItem)) {
            remainTime = validItem.expireDate - TSUtility.getServerBaseNowUnixTime();
        }
        return remainTime;
    }

    public getRemainTimeHeroCenturionClique(): number {
        const winstonHero = UserInfo.instance().getUserHeroInfo().getHeroInfo("hero_winston");
        if (winstonHero == null) return 0;

        let remainTime = -1;
        if (!winstonHero.isExpired()) {
            remainTime = winstonHero.expireDate - TSUtility.getServerBaseNowUnixTime();
        }
        return remainTime;
    }

    public showCenturionCliqueMainPopup(closeCallback?: Function): void {
        PopupManager.Instance().showDisplayProgress(true);
        CenturionCliqueMainPopup.getPopup((error, popup) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (error) {
                cc.log("CenturionCliqueMainPopup.getPopup error: %s", error);
            } else {
                popup.openPopup();
                if (TSUtility.isValid(closeCallback)) {
                    popup.setCloseCallback(closeCallback);
                }
            }
        });
    }

    public showCenturionCliqueInvitePopup(): void {
        CenturionCliqueInvitePopup.getPopup((error, popup) => {
            if (error) {
                cc.log("CenturionCliqueInvitePopup.getPopup error: %s", error);
            } else {
                popup.openPopup();
            }
        });
    }

    public isShowCenturionCliqueInvitePopup(inboxInfo: any): boolean {
        return this.getValidCenturionCliqueRewardInboxInfo(inboxInfo) != null;
    }

    public getValidCenturionCliqueRewardInboxInfo(inboxInfo: any): any {
        const inboxMsgList = inboxInfo.inboxMessages.slice();
        let validMsg = null;
        const nowUnix = TSUtility.getServerBaseNowUnixTime();
        for (let i = 0; i < inboxMsgList.length; ++i) {
            const msgItem = inboxMsgList[i];
            if (msgItem.message.mType === INBOX_ITEM_TYPE.INBOX_REWARD_CENTURION_CLIQUE && msgItem.message.expireDate > nowUnix) {
                validMsg = msgItem;
                break;
            }
        }
        return validMsg;
    }

    public isShowInboxInFirstEntranceProcess(inboxInfo: any): boolean {
        return !CenturionCliqueManager.Instance().isShowCenturionCliqueInvitePopup(inboxInfo) || ServerStorageManager.getAsBoolean(StorageKeyType.CENTURION_CLIQUE_TUTORIAL);
    }

    // ===================== 定时器监听 - 百夫长权益过期校验 完整保留 =====================
    public setSchedulerCheckExpireCenturionCliqueItem(): void {
        if (this.getRemainTimeCenturionClique() < 0) {
            this.unschedule(this.checkExpireCenturionClique);
        } else {
            this.schedule(this.checkExpireCenturionClique, 1);
        }
    }

    private checkExpireCenturionClique(): void {
        if (this.getRemainTimeCenturionClique() < 0) {
            this.unschedule(this.checkExpireCenturionClique);
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_CENTURION_CLIQUE);
        }
    }

    public setSchedulerCheckExpireCenturionCliqueHero(): void {
        if (this.getRemainTimeHeroCenturionClique() < 0) {
            this.unschedule(this.checkExpireCenturionCliqueHero);
        } else {
            this.schedule(this.checkExpireCenturionCliqueHero, 1);
        }
    }

    private checkExpireCenturionCliqueHero(): void {
        if (this.getRemainTimeHeroCenturionClique() < 0) {
            this.unschedule(this.checkExpireCenturionCliqueHero);
            const heroInfo = UserInfo.instance().getUserHeroInfo();
            let lastActiveDate = 0;
            let targetHeroId:any = "";

            heroInfo.heroes.forEach((hero) => {
                if (!hero.isCenturionCliqueHero() && hero.lastActiveDate > lastActiveDate) {
                    lastActiveDate = hero.lastActiveDate;
                    targetHeroId = hero.id;
                }
            });

            if (targetHeroId !== "") {
                CommonServer.Instance().requestChangeActiveHero(targetHeroId, (response) => {
                    if (!CommonServer.isServerResponseError(response)) {
                        UserInfo.instance().changeActiveHero(targetHeroId);
                        UserInfo.instance().asyncRefreshHeroInfo();
                    } else {
                        UserInfo.instance().asyncRefreshHeroInfo();
                    }
                }, true);
            } else {
                UserInfo.instance().asyncRefreshHeroInfo();
            }
        }
    }
}