
const { ccclass } = cc._decorator;
import PowerGemManager from "./manager/PowerGemManager";
import SupersizeItManager from "./SupersizeItManager";
// import SlotTourneyManager from "../../Utility/SlotTourneyManager";
//import SlotBannerInfo from "../Banner/SlotBannerInfo";
import TSUtility from './global_utility/TSUtility';
import SDefine from './global_utility/SDefine';
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";

export var SlotBannerType;
(function (SlotBannerType) {
    SlotBannerType.NONE = "None";
    SlotBannerType.EMPTY = "EmptySlot";
    SlotBannerType.DECO = "DecoSlot";
    SlotBannerType.SERVICE_BANNER = "ServiceBanner";
    SlotBannerType.EARLY_ACCESS = "EarlyAccessSlot";
    SlotBannerType.NEW = "NewSlot";
    SlotBannerType.SUPERSIZE_IT = "SuperSizeItSlot";
    SlotBannerType.RECENTLY = "RecentlySlot";
    SlotBannerType.POWER_GEM = "PowerGemSlot";
    SlotBannerType.HOT = "HotSlot";
    SlotBannerType.FEATURED = "FeaturedSlot";
    SlotBannerType.TOURNEY = "TourneySlot";
    SlotBannerType.REVAMP = "RevampSlot";
    SlotBannerType.REEL_QUEST = "ReelQuestSlot";
    SlotBannerType.LINKED = "LinkedSlot";
    SlotBannerType.NORMAL = "NormalSlot";
    SlotBannerType.MOST_PLAYED = "MostPlayedSlot";
    SlotBannerType.FAVORITES = "FavoritesSlot";
    SlotBannerType.DYNAMIC = "DynamicSlot";
    SlotBannerType.SUITE_NEW = "SuiteNewSlot";
    SlotBannerType.SUITE_RANKING = "SuiteRankingSlot";
    SlotBannerType.SUITE_JACKPOT = "SuiteJackpotSlot";
})(SlotBannerType || (SlotBannerType = {}));

export var SlotBannerDecoType;
(function (SlotBannerDecoType) {
    SlotBannerDecoType.NONE = "None";
    SlotBannerDecoType.ALL_SLOTS = "AllSlots";
    SlotBannerDecoType.SLOT_LINE = "SlotLine";
})(SlotBannerDecoType || (SlotBannerDecoType = {}));

@ccclass
export default class LobbySlotBannerInfo {
    _prefabSize = cc.size(0, 0);
    _data = null;

    static getSlotBannerInfo(e) {
        switch (e) {
            case SlotBannerType.EMPTY:
                return new LobbySlotBannerInfo_EMPTY();
            case SlotBannerType.DECO:
                return new LobbySlotBannerInfo_DECO();
            case SlotBannerType.SERVICE_BANNER:
                return new LobbySlotBannerInfo_SERVICE_BANNER();
            case SlotBannerType.EARLY_ACCESS:
                return new LobbySlotBannerInfo_EARLY_ACCESS();
            case SlotBannerType.NEW:
                return new LobbySlotBannerInfo_NEW();
            case SlotBannerType.SUPERSIZE_IT:
                return new LobbySlotBannerInfo_SUPERSIZE_IT();
            case SlotBannerType.RECENTLY:
                return new LobbySlotBannerInfo_RECENTLY();
            case SlotBannerType.POWER_GEM:
                return new LobbySlotBannerInfo_POWER_GEM();
            case SlotBannerType.HOT:
                return new LobbySlotBannerInfo_HOT();
            case SlotBannerType.FEATURED:
                return new LobbySlotBannerInfo_FEATURED();
            case SlotBannerType.TOURNEY:
                return new LobbySlotBannerInfo_TOURNEY();
            case SlotBannerType.REVAMP:
                return new LobbySlotBannerInfo_REVAMP();
            case SlotBannerType.REEL_QUEST:
                return new LobbySlotBannerInfo_REEL_QUEST();
            case SlotBannerType.LINKED:
                return new LobbySlotBannerInfo_LINKED();
            case SlotBannerType.NORMAL:
                return new LobbySlotBannerInfo_NORMAL();
            case SlotBannerType.MOST_PLAYED:
                return new LobbySlotBannerInfo_MOST_PLAYED();
            case SlotBannerType.FAVORITES:
                return new LobbySlotBannerInfo_FAVORITES();
            case SlotBannerType.DYNAMIC:
                return new LobbySlotBannerInfo_DYNAMIC();
            case SlotBannerType.SUITE_RANKING:
                return new LobbySlotBannerInfo_SUITE_RANKING();
            case SlotBannerType.SUITE_NEW:
                return new LobbySlotBannerInfo_SUITE_NEW();
            case SlotBannerType.SUITE_JACKPOT:
                return new LobbySlotBannerInfo_SUITE_JACKPOT();
            default:
                return null;
        }
    }

    getSlotBannerType() {
        return SlotBannerType.NONE;
    }

    get type() {
        return this.getSlotBannerType();
    }

    get prefabSize() {
        return this.getPrefabSize();
    }

    set prefabSize(e) {
        this._prefabSize = e;
    }

    getPrefabSize() {
        return this._prefabSize;
    }

    getPreloadCount() {
        return 1;
    }

    get preloadCount() {
        return this.getPreloadCount();
    }

    isAvailable() {
        return !0;
    }

    get available() {
        return this.isAvailable();
    }

    getSlotBannerInfoArray() {
        return Array.isArray(this.data) && this.data.every(function (e) {
            return !TSUtility.isValid(e) ;//|| e instanceof SlotBannerInfo;
        }) ? this.data : [];
    }

    get arrSlotBanner() {
        return this.getSlotBannerInfoArray();
    }

    get data() {
        return this._data;
    }

    setData(e) {
        this._data = e;
    }
}

export class LobbySlotBannerInfo_EMPTY extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.EMPTY;
    }

    getPreloadCount() {
        return 10;
    }

    getPrefabSize() {
        return!TSUtility.isValid(this.data) || "number" != typeof this.data ? cc.size(0, 0) : cc.size(this.data, 380);
    }
}

export class LobbySlotBannerInfo_DECO extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.DECO;
    }

    getPrefabSize() {
        var e = this.data;
        return !TSUtility.isValid(this.data) || !TSUtility.isValid(e) ? cc.size(0, 0) : e === SlotBannerDecoType.ALL_SLOTS ? cc.size(56, 400) : e === SlotBannerDecoType.SLOT_LINE ? cc.size(42, 400) : cc.size(0, 0);
    }
}

export class LobbySlotBannerInfo_SERVICE_BANNER extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.SERVICE_BANNER;
    }

    getPreloadCount() {
        return 4;
    }
}

export class LobbySlotBannerInfo_EARLY_ACCESS extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.EARLY_ACCESS;
    }

    isAvailable() {
        return this.arrSlotBanner.length > 0;
    }
}

export class LobbySlotBannerInfo_NEW extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.NEW;
    }

    isAvailable() {
        return this.arrSlotBanner.length > 0;
    }
}

export class LobbySlotBannerInfo_SUPERSIZE_IT extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.SUPERSIZE_IT;
    }

    isAvailable() {
        return SupersizeItManager.instance.isAvailablePromotion() && SupersizeItManager.instance.isEnableEvent();
    }
}

export class LobbySlotBannerInfo_RECENTLY extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.RECENTLY;
    }
}

export class LobbySlotBannerInfo_POWER_GEM extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.POWER_GEM;
    }

    isAvailable() {
        return PowerGemManager.instance.isAvailablePowerGem(!0, !0);
    }

    getSlotBannerInfoArray() {
        for (var e = PowerGemManager.instance.getPowerGemSlotIDs(), t = [], n = 0; n < e.length; n++) {
            var o = ServiceSlotDataManager.instance.getSlotBannerInfo(SDefine.VIP_LOUNGE_ZONEID, e[n]);
            TSUtility.isValid(o) && t.push(o);
        }
        return t;
    }
}

export class LobbySlotBannerInfo_HOT extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.HOT;
    }

    getPrefabSize() {
        return this.arrSlotBanner.length <= 3 ? cc.size(790, 470) : cc.size(1020, 470);
    }
}

export class LobbySlotBannerInfo_FEATURED extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.FEATURED;
    }

    isAvailable() {
        return this.arrSlotBanner.length > 0;
    }
}

export class LobbySlotBannerInfo_TOURNEY extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.TOURNEY;
    }

    isAvailable() {
        return false;//0 != SDefine.SlotTournament_Use && 0 != SlotTourneyManager.Instance().getCurrentTourneyInfo().isValidTourneyInfo();
    }
}

export class LobbySlotBannerInfo_REVAMP extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.REVAMP;
    }

    isAvailable() {
        return this.arrSlotBanner.length > 0;
    }
}

export class LobbySlotBannerInfo_LINKED extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.LINKED;
    }

    getPreloadCount() {
        return 4;
    }

    getSlotBannerInfoArray() {
        var e = this.data;
        return !TSUtility.isValid(e) ? [] : [e.infoLeftBanner, e.infoRightBanner];
    }
}

export class LobbySlotBannerInfo_REEL_QUEST extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.REEL_QUEST;
    }

    isAvailable() {
        return this.arrSlotBanner.length > 0;
    }
}

export class LobbySlotBannerInfo_NORMAL extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.NORMAL;
    }

    getPrefabSize() {
        return this.arrSlotBanner.length <= 1 ? cc.size(244, 400) : cc.size(224, 400);
    }

    getPreloadCount() {
        return 20;
    }
}

export class LobbySlotBannerInfo_DYNAMIC extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.DYNAMIC;
    }

    getPrefabSize() {
        return this.arrSlotBanner.length, cc.size(224, 400);
    }

    getPreloadCount() {
        return 20;
    }
}

export class LobbySlotBannerInfo_SUITE_RANKING extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.SUITE_RANKING;
    }
}

export class LobbySlotBannerInfo_SUITE_NEW extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.SUITE_NEW;
    }
}

export class LobbySlotBannerInfo_SUITE_JACKPOT extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.SUITE_JACKPOT;
    }
}

export class LobbySlotBannerInfo_MOST_PLAYED extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.MOST_PLAYED;
    }
}

export class LobbySlotBannerInfo_FAVORITES extends LobbySlotBannerInfo {
    getSlotBannerType() {
        return SlotBannerType.FAVORITES;
    }
}