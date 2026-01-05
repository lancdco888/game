import LobbyScene from "./LobbyScene";
import UserInfo from "./User/UserInfo";
import TSUtility from "./global_utility/TSUtility";
import MessageRoutingManager from "./message/MessageRoutingManager";

const {ccclass, property} = cc._decorator;

// 定义UI类型枚举
export enum LobbyUIType {
    NONE = "None",
    TUTORIAL = "Tutorial",
    BANNER_SCROLL_VIEW = "ScrollView",
    MEMBERS = "Members",
    PROFILE = "Profile",
    EXP_INFO = "ExpInfo",
    LEVEL_BOOSTER = "LevelBooster",
    LEVEL_UP_PASS = "LevelUpPass",
    PIGGY_BANK = "PiggyBank",
    CENTURION = "Centurion",
    JACKPOT = "Jackpot",
    BANKROLL = "Bankroll",
    COUPON = "Coupon",
    MENU = "Menu",
    SEARCH = "Search",
    SIDE_MENU = "SideMenu",
    EVENT = "Event",
    CLUB = "Club",
    MISSION = "Mission",
    HYPER_PASS = "HyperPass",
    STAR_ALBUM = "StarAlbum",
    HERO = "Hero",
    INBOX = "Inbox",
    REWARD_CENTER = "RewardCenter"
}

@ccclass()
export default class LobbyUIBase extends cc.Component {
    get eType(): LobbyUIType {
        return LobbyUIType.NONE;
    }

    get numRedDot(): number {
        return this.getRedDotCount();
    }

    get isAvailable(): boolean {
        return this.isAvailableUI();
    }

    get numUserLevel(): number {
        return 0;//ServiceInfoManager.instance().getUserLevel();
    }

    get inventory(): any {
        return 0;//UserInfo.instance().getItemInventory();
    }

    get isNewbie(): boolean {
        return this.lobbyUI.isFirstLoginUser();
    }

    get lobbyUI(): any {
        return LobbyScene.instance.UI;
    }

    get lobbyUIType(): any {
        return this.lobbyUI.type;
    }

    get infoIntroduce(): any {
        return null;
    }

    public updateUI(): void {
        this.refresh();
        this.updateIntroduce();
    }

    public async initialize(): Promise<void> {
        return Promise.resolve();
    }

    public isAvailableUI(): boolean {
        return true;
    }

    public refresh(): void { }

    public getRedDotCount(): number {
        return 0;
    }

    public updateIntroduce(coinType: string = ""): void {
        if (!TSUtility.isValid(this.infoIntroduce)) {
            return;
        }
        
        // ServiceInfoManager.STRING_CURRENT_INTRODUCE_NAME = "";
        // if (coinType == this.infoIntroduce.coinType && TSUtility.isValid(this.infoIntroduce.callBack)) {
        //     this.infoIntroduce.callBack();
        //     this.infoIntroduce.callBack = null;
        // }
        // if (TSUtility.isValid(this.infoIntroduce.nodeCoin) && this.infoIntroduce.mainType != TutorialCoinPromotion.INTRODUCE_MAIN.NONE) {
        //     this.infoIntroduce.nodeCoin.active = false;
        //     const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.NewServiceIntroduceCoinPromotion.PromotionKeyName);
        //     if (!TSUtility.isValid(promotionInfo) || promotionInfo.getMainStep() < 0 || !ServerStorageManager.getAsBoolean(ServerStorageManager.StorageKeyType.FIRST_VISIT_LOBBY)) {
        //         return;
        //     }
        //     this.infoIntroduce.nodeCoin.active = this.getCurrentIntroduceStep() == this.infoIntroduce.mainType;
        // }
    }

    public getCurrentIntroduceStep(): number {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.NewServiceIntroduceCoinPromotion.PromotionKeyName);
        // if (!TSUtility.isValid(promotionInfo) || promotionInfo.getMainStep() < 0 || !ServerStorageManager.getAsBoolean(ServerStorageManager.StorageKeyType.FIRST_VISIT_LOBBY)) {
        //     return TutorialCoinPromotion.INTRODUCE_MAIN.NONE;
        // }
        // return promotionInfo.getMainStep();
        return 0;
    }

    public isEnableIntroduce(): boolean {
        // if (!TSUtility.isValid(this.infoIntroduce)) {
        //     return false;
        // }
        // if (ServiceInfoManager.STRING_CURRENT_INTRODUCE_NAME == this.infoIntroduce.coinType) {
        //     return true;
        // }
        // const step = this.getCurrentIntroduceStep();
        // if (step == TutorialCoinPromotion.INTRODUCE_MAIN.NONE) {
        //     return false;
        // }
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.NewServiceIntroduceCoinPromotion.PromotionKeyName);
        // const isEnable = step == this.infoIntroduce.mainType 
        //                 && promotionInfo.getMainStepState(this.infoIntroduce.mainType) != 1 
        //                 && ServerStorageManager.getAsBoolean(ServerStorageManager.StorageKeyType.FIRST_VISIT_LOBBY);
        // if (isEnable) {
        //     this.infoIntroduce.nodeCoin.getComponent(TutorialCoinPromotion).onCollect();
        // }
        // return isEnable;
        return false;
    }

    public getLobbyUI(type: LobbyUIType): any {
        return this.lobbyUI.getLobbyUI(type);
    }

    public getLobbyUIArray(type: LobbyUIType): any[] {
        return this.lobbyUI.getLobbyUIArray(type);
    }

    public openTooltip(data: any): void {
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.LOBBY_OPEN_TOOLTIP, data);
    }
}
