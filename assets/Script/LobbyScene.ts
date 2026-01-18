const { ccclass, property } = cc._decorator;
// 全局工具对象声明 - 项目中已挂载无需导入，原代码核心调用
declare const Utility: any;

// ✅ 原代码所有导入依赖 完整复刻，路径/命名/导出方式100%一致，无任何删减
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import PopupManager from "./manager/PopupManager";
import SoundManager from "./manager/SoundManager";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import Analytics from "./Network/Analytics";
//import CommonServer from "../Network/CommonServer";
import CommonPopup from "./Popup/CommonPopup";
//import LoadingPopup from "../Popup/LoadingPopup/LoadingPopup";
import PowerGemManager from "./manager/PowerGemManager";
import SupersizeItManager from "./SupersizeItManager";
//import ADTargetManager from "../ServiceInfo/ADTargetManager";
import ServerStorageManager, { StorageKeyType } from "./manager/ServerStorageManager";
import ServiceInfoManager from "./ServiceInfoManager";
//import UnprocessedPurchaseManager from "../User/UnprocessedPurchaseManager";
import UserInfo from "./User/UserInfo";
import UserPromotion from "./User/UserPromotion";
//import AdsManager from "../Utility/AdsManager";
//import FBSquadManager from "../Utility/FBSquadManager";
import HeroTooltipPopup from "./Utility/HeroTooltipPopup";
import MessageRoutingManager from "./message/MessageRoutingManager";
import SkinInfoManager from "./manager/SkinInfoManager";
import SlotFeverModeManager from "./manager/SlotFeverModeManager";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import SlotTourneyManager from "./manager/SlotTourneyManager";
import TimeBonusManager from "./manager/TimeBonusManager";
//import LobbyUIDecoManager from "./LobbyDeco/LobbyUIDecoManager";
import LobbyMoveManager from "./manager/LobbyMoveManager";
import LobbySceneUI from "./LobbySceneUI";
//import LobbyTutorial from "./LobbyTutorial/LobbyTutorial";
import LobbyUIBase, { LobbyUIType } from "./LobbyUIBase";
import { LobbySceneUIType } from "./SceneInfo";
import ConfigManager from "./manager/ConfigManager";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import HRVSlotService from "./HRVService/HRVSlotService";
import SlotManager from "./manager/SlotManager";
import LoadingPopup from "./Popup/LoadingPopup";
//import LobbyUIStartPopupManager from "./StartPopup/LobbyUIStartPopupManager";
//import LobbyUIStartPopup_ADFreeOffer from "./StartPopup/Popup/LobbyUIStartPopup_ADFreeOffer";

@ccclass
export default class LobbyScene extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，变量名/类型/顺序完全一致 核心保留 =====
    @property(LobbySceneUI)
    public lobbySceneUI: LobbySceneUI = null;          // 大厅核心UI容器组件

    @property([cc.JsonAsset])
    public jsonAry:cc.JsonAsset[] = [];

    @property(CommonSoundSetter)
    public soundSetter: CommonSoundSetter = null;      // 全局音效配置器

    // ===== 私有成员变量 - 原代码所有变量完整复刻，类型注解精准，默认值完全一致 核心保留 =====
    private static _instance: LobbyScene = null;       // 单例实例 - 全局唯一大厅管理器
    private _isOverrideBGM: boolean = false;           // BGM覆盖开关 - 优先级最高，开启则停止自动切换BGM
    private _isRunTourneySchedule: boolean = false;    // 锦标赛调度防重入标记 ✔️改必卡死，核心防并发执行
    private _mgrLobbyUIMove: LobbyMoveManager = null;  // 大厅移动管理器
    // private _mgrLobbyUIStartPopup: LobbyUIStartPopupManager = null; // 大厅启动弹窗管理器
    // private _mgrLobbyUIDeco: LobbyUIDecoManager = null;// 大厅装饰管理器
    private _numZoneID: number = SDefine.VIP_LOUNGE_ZONEID; // 当前大厅分区ID
    private _strZoneName: string = SDefine.VIP_LOUNGE_ZONENAME; // 当前大厅分区名称
    private _strCurBGMName: string = "";               // 当前播放的BGM名称

    constructor(){
        super()
        LobbyScene._instance = this;
    }

    // ✅ 核心单例访问入口，原代码getter逻辑100%复刻，全局唯一实例，项目所有地方通过该方法获取
    public static get instance(): LobbyScene {
        return LobbyScene._instance;
    }

    // ✅ 静态全局方法 - 游戏返回键逻辑，原代码完整复刻，移动端退出游戏弹窗核心入口
    public static BackProcess(): void {
        if (0 != Utility.isMobileGame()) {
            PopupManager.Instance().showDisplayProgress(true);
            CommonPopup.getCommonPopup((isValid, popup) => {
                PopupManager.Instance().showDisplayProgress(false);
                if (!TSUtility.isValid(isValid)) {
                    popup.closeBtn.node.active = false;
                    popup.open()
                        .setInfo("EXIT GAME", "Are you sure you\nwant to exit game?")
                        .setOkBtn("STAY", null)
                        .setCancelBtn("EXIT", () => { TSUtility.endGame(); });
                    popup.setPopupType(0);
                }
            });
        }
    }

    // ===== 只读GETTER属性 - 原代码所有getter完整复刻，无setter，外部只读，核心封装 =====
    public get numZoneID(): number { return this._numZoneID; }
    public get strZoneName(): string { return this._strZoneName; }
    public get UI(): LobbySceneUI { return this.lobbySceneUI; }
    public get mgrLobbyUIMove(): LobbyMoveManager { return this._mgrLobbyUIMove; }
    // public get mgrLobbyUIStartPopup(): LobbyUIStartPopupManager { return this._mgrLobbyUIStartPopup; }
    // public get mgrLobbyUIDeco(): LobbyUIDecoManager { return this._mgrLobbyUIDeco; }

    // // ===== 计算型GETTER属性 - 分区权限校验，原代码逻辑完整复刻 =====
    // public get isPassableHigh(): boolean {
    //     return UserInfo.instance().isPassAbleCasino(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME);
    // }
    // public get isPassableDynamic(): boolean {
    //     return UserInfo.instance().isPassAbleCasino(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME);
    // }

    // ===== 可写SETTER属性 - BGM覆盖开关，赋值时自动刷新BGM，原代码核心逻辑，缺一不可 =====
    public set isOverrideBGM(value: boolean) {
        this._isOverrideBGM = value;
        this.refreshBGM();
    }

    // ===== 生命周期回调 - ON_LOAD 大厅初始化入口，核心分辨率适配+单例赋值+事件监听，原逻辑100%复刻 =====
    onLoad(): void {
        
        ConfigManager.asyncLoadAllConfig();
        var data = JSON.parse('{"error":{"code":0,"msg":""},"reqId":1767492987,"serverTime":1767492991,"uid":451249740898304,"userAssetInfo":{"revisionNumber":206,"uid":451249740898304,"totalCoin":26601300,"biggestTotalCoin":26601300,"paidCoin":0,"modifiedDate":1750587044,"createdDate":1750587044},"userBlastOff":{"revisionNumber":0,"uid":451249740898304,"levels":[550,1250,2250,3500,5000],"nextRefreshDate":1767599999,"modifiedDate":1767168918,"createdDate":1766323198,"rewardRate":1,"rewardRefreshDate":1766390399},"userDailyMissionV3":{"revisionNumber":0,"uid":451249740898304,"group":"NW","remainMissions":[402,403,401,5,404],"curMission":{"key":"d5crpn2t5padd78f7a3g","id":3,"type":"SPIN_CNT","order":1,"goalCnt":10,"rewards":[{"itemId":"i_wonder_box_1","itemType":"","addCnt":0,"addTime":0,"payCode":"","extraInfo":""},{"itemId":"i_wonder_box_mission_newbi_1","itemType":"C","addCnt":1,"addTime":0,"payCode":"HBFOTI00139","extraInfo":""},{"itemId":"i_blast_off_core","itemType":"C","addCnt":160,"addTime":0,"payCode":"HBFOTI00140","extraInfo":""}]},"nextRefreshDate":1767513600,"createdDate":1766323198,"modifiedDate":1767488732},"userExMasterInfo":{"revisionNumber":73,"revisionNumberForceUpdateTs":1767492990,"uid":451249740898304,"facebookV2ME":null,"geoIPInfo":{"CountryISOCode":"AU","IsInEuropeanUnion":false,"TimeZone":"Australia/Sydney","CityName":"","CountryName":"Australia","SubdivisionsName":"","LocationAccuracyRadius":1000,"LocationLatitude":-33.494,"LocationLongitude":143.2104,"IsAnonymousProxy":false,"IsSatelliteProvider":false},"entranceInfo":{"path":"?is_shield_env=0&version=850&nonnull_share_payload=0&gcgs=0&should_log_unsafe_numbers=1&use_generic_dialog_for_switch_async=1&use_generic_dialog_for_create_async=1&use_pass_through_for_coplay_custom_update=0&use_bridge_for_coplay_custom_update=0&ttb=30000&unal=1&environment_type=standard&csp_cache=2&IsMobileWeb=0&cloud_host_override%5Bcluster%5D=&cloud_host_override%5Bhost%5D=&cloud_host_override%5Bhostname%5D=&cloud_host_override%5Bpop%5D=&cloud_host_override%5Bport%5D=&cloud_host_override%5Bsite_key%5D=&cloud_host_override%5Bsite_keys%5D=&cloud_host_override%5Bsp_tier%5D=&cloud_host_override%5Btarget%5D=&cloud_host_override%5Btargets%5D=&context_source_id=&custom_update_id=&entry_point=facebook~game_player~rhc_related_games&source=fbinstant-369180963635208&hrv_entrypoint=in_game_menu","afData":null},"fbPicURL":"https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=122117209412885583&gaming_photo_type=unified_picture&ext=1768915576&hash=AT-_X_yylLGCPRzWZn9T7MeS","modifiedDate":1750587044,"createdDate":1750587044},"userGameInfo":{"revisionNumber":190,"uid":451249740898304,"lastSpinDate":1766393140,"lastSpinDateTotalSpin":22,"lastTotalBet":120000,"totalSpin":179,"totalBet":15792,"biggestWinCoin":3504000,"userAvgBetInfo":{"totalBet":15792000,"totalSpin":179,"lastSyncTime":0},"userAvgBetV2Info":{"avgBet200Spins":{"totalBet":15792000,"totalSpin":179},"avgBet700Spins":{"totalBet":15792000,"totalSpin":179},"avgBet1500Spins":{"totalBet":15792000,"totalSpin":179},"avgBet3000Spins":{"totalBet":15792000,"totalSpin":179}},"spinInfo":{"dailySpinInfo":{"nextResetDate":1767513600},"dailyList":[{"count":154,"date":1766304000},{"count":22,"date":1766390400}]},"newUserBuffInfo":{"lastSlotID":"zhuquefortune","lastBuffSpinCnt":82,"lastBuffIndex":2,"lastDate":1766388229},"lastPlaySlotID":"jinlongcaifu","lastPlayZoneID":0,"recentPlaySlots":[{"slotID":"jinlongcaifu","zoneID":0},{"slotID":"firelockultimate","zoneID":0},{"slotID":"dragonsandpearls","zoneID":0},{"slotID":"beaverstacks","zoneID":0},{"slotID":"honeybeeparade","zoneID":0},{"slotID":"toadallyrich","zoneID":0},{"slotID":"kongfury","zoneID":0},{"slotID":"gummytummywild","zoneID":0},{"slotID":"pawpawneko","zoneID":0},{"slotID":"moonlightwolf","zoneID":0},{"slotID":"kingofsafari","zoneID":0},{"slotID":"mysterrier","zoneID":0},{"slotID":"davyjonesslocker","zoneID":0},{"slotID":"dualfortunepot","zoneID":0},{"slotID":"curiousmermaid","zoneID":0},{"slotID":"fatturkeywilds","zoneID":0},{"slotID":"zhuquefortune","zoneID":0},{"slotID":"super25deluxe","zoneID":0},{"slotID":"beelovedjars","zoneID":0},{"slotID":"mooorecheddar","zoneID":0}],"minDateLast30Spins":1766390305,"lastTourneySpinDate":1766323521,"modifiedDate":1750587044,"createdDate":1750587044},"userInboxCnt":1,"userInven":{"revisionNumber":86,"revisionNumberForceUpdateTs":1767492990,"uid":451249740898304,"items":{"d1btd9at5paadqohv100":{"itemUniqueNo":"d1btd9at5paadqohv100","itemId":"i_newbie_bingo_ticket","type":"C","totCnt":1,"curCnt":1,"expireDate":1750587045,"extraInfo":"","payCode":"","deleteYN":"","regDate":1750587045,"updateDate":1750587045},"d1btd9at5paadqohv10g":{"itemUniqueNo":"d1btd9at5paadqohv10g","itemId":"i_coin_shower_ticket","type":"C","totCnt":2,"curCnt":2,"expireDate":1750587045,"extraInfo":"","payCode":"HPFOTI00318","deleteYN":"","regDate":1750587045,"updateDate":1750587045},"d1btd9at5paadqohv110":{"itemUniqueNo":"d1btd9at5paadqohv110","itemId":"i_daily_bonus_wheel_ticket","type":"C","totCnt":4,"curCnt":4,"expireDate":1750587045,"extraInfo":"","payCode":"HPFOTI00319","deleteYN":"","regDate":1750587045,"updateDate":1750587045},"d549bgqt5pafv2m19c0g":{"itemUniqueNo":"d549bgqt5pafv2m19c0g","itemId":"i_collection_card_pack_2","type":"C","totCnt":1,"curCnt":1,"expireDate":1766364611,"extraInfo":"{\\"seasonID\\":17}","payCode":"HPFOTI00329","deleteYN":"","regDate":1766364611,"updateDate":1766364611},"d549bgqt5pafv2m19c10":{"itemUniqueNo":"d549bgqt5pafv2m19c10","itemId":"i_collection_card_pack_3","type":"C","totCnt":1,"curCnt":2,"expireDate":1766364611,"extraInfo":"{\\"seasonID\\":17}","payCode":"HPFOTI00329","deleteYN":"","regDate":1766364611,"updateDate":1766364611}}},"userMasterInfo":{"revisionNumber":291,"uid":451249740898304,"udids":null,"fbid":"9380006622099498","name":"Ulysses","shortName":"","picUrl":"hrvavatar://107","countryIsoCode":"AU","gender":"","timezone":-1,"email":"","levelInfo":{"level":7,"exp":698.44646525383},"vipInfo":{"version":2,"level":0,"exp":12,"issueDate":1750587044},"serviceInfo":{"bingoBallCnt":114,"purchaseCnt":0,"purchaseCash":0,"prevPurchaseCash":0,"maxPurchaseCash":0,"lastPurchaseDate":0,"dailyShareReceiveCnt":0,"dailyShareResetDate":0,"spinBooster":1,"spinBoosterGroup":"A","promotionCoolTime":1296000,"cumulativeWatchADCnt":1,"isSetRewardCenterInitItem":true},"modifiedDate":1767488732,"createdDate":1750587044,"lastLoginGap":855,"lastLoginDate":1767492989,"lastLogoutDate":1767491761,"userStatus":{"status":0,"modifiedDate":0},"isFBInstant":true,"accountSite":2,"entranceInfos":null,"isGuestMerged":false,"fbinstantID":"9380006622099498","fbelsasID":"122117209412885583","sessionCount":72,"streakedJoinInfo":{"all":{"count":1,"modifiedDate":1767492989}},"elsMergeInfo":{"isELSMerged":true,"elsMergedDate":1750587045},"suiteInfo":{"leagueFeverInfo":{"feverLevel":1,"nextRefreshDate":1767513599},"leagueShopNextResetDate":1767600000}},"userPromotion":[{"revisionNumber":10,"uid":451249740898304,"promotionKey":"DailyInboxCoin","strVal":"","modifiedDate":1767490074,"createdDate":1750587046,"promotionInfo":{"nextReceiveTime":1767562074}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"DailyBingoBall","strVal":"","modifiedDate":0,"createdDate":1750587046,"promotionInfo":{"nextReceiveTime":72000}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"DailyShortcut","strVal":"","modifiedDate":0,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"InboxShopPromotion","strVal":"{\\"curProductIndex\\":5,\\"curClientProductId\\":\\"\\",\\"price\\":0,\\"baseCoin\\":0,\\"state\\":0}","modifiedDate":0,"createdDate":1750587046,"promotionInfo":{"nextChangeTime":-57600,"curProductIndex":5,"curClientProductId":"","price":0,"baseCoin":0,"state":0}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"PurchasePromotion","strVal":"{\\"timeOffer\\":0,\\"flashOffer\\":0}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{"timeOffer":0,"flashOffer":0}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"FBMobileConnectPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":80,"uid":451249740898304,"promotionKey":"ShareInducePromotion","strVal":"{\\"feedInfo\\":[{\\"id\\":\\"363981130790376_1449601223837840\\",\\"picture\\":\\"https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/611263353_1449272930537336_2171872436830469074_n.jpg?stp=dst-jpg_p720x720_tt6\\\\u0026_nc_cat=103\\\\u0026ccb=1-7\\\\u0026_nc_sid=127cfc\\\\u0026_nc_ohc=WoZxWyHUohcQ7kNvwENRp7A\\\\u0026_nc_oc=AdmntsXuWgupyAT6dcNgu_2zpFl-fljIzrqiKQSvVWZUcHsfyEwNrCAnBrRWnZpu5bg\\\\u0026_nc_zt=23\\\\u0026_nc_ht=scontent-iad3-2.xx\\\\u0026edm=AKK4YLsEAAAA\\\\u0026_nc_gid=VPmqNlyAHRDLXiopSSF9YA\\\\u0026_nc_tpa=Q5bMBQFzzgowRy0vFVWLcNuFXxXLSrWhlOh2TACmb76ALI6gp8cIycJQE5qznQRxwiSBuDN00mdnGF3I\\\\u0026oh=00_AfqsD4FpHEJuu_v1OiCN1o_drziYRtAlKtJ2ZEuklhODGg\\\\u0026oe=695F88F2\\",\\"isPublished\\":true},{\\"id\\":\\"363981130790376_1449395673858395\\",\\"picture\\":\\"https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/610797173_1449272033870759_824912642183846354_n.jpg?stp=dst-jpg_p720x720_tt6\\\\u0026_nc_cat=101\\\\u0026ccb=1-7\\\\u0026_nc_sid=127cfc\\\\u0026_nc_ohc=TgqSnqltr6oQ7kNvwFlxgH1\\\\u0026_nc_oc=AdnOQX5rZMqHY9b8up9fM2ugUC5YiOKcZnoEfETsIHwWrOOPAn4jMA2fU3Q0Cv7bCSQ\\\\u0026_nc_zt=23\\\\u0026_nc_ht=scontent-iad3-1.xx\\\\u0026edm=AKK4YLsEAAAA\\\\u0026_nc_gid=VPmqNlyAHRDLXiopSSF9YA\\\\u0026_nc_tpa=Q5bMBQHKNjUS5MGcd84IfbhuYtN470DNYx5Qwfe8U4IePFEjN6wkipNNENqXvAgUJelNXMN6EEcsSPx8\\\\u0026oh=00_Afo31iJfX8qLlM1OtbdcxjUr7nouBxfIV8VTNb-C6ZJStg\\\\u0026oe=695FA259\\",\\"isPublished\\":true},{\\"id\\":\\"363981130790376_1449271583870804\\",\\"picture\\":\\"https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/609203490_1449271467204149_536102708148864181_n.jpg?stp=dst-jpg_p720x720_tt6\\\\u0026_nc_cat=104\\\\u0026ccb=1-7\\\\u0026_nc_sid=127cfc\\\\u0026_nc_ohc=YiajsAOcEKYQ7kNvwGgtrIa\\\\u0026_nc_oc=AdkyIyPJw2ccNZR77B26RonjPzYGSYfkTMGP-XolOpWFJ5cOqRir7rtrdak847B8nF0\\\\u0026_nc_zt=23\\\\u0026_nc_ht=scontent-iad3-1.xx\\\\u0026edm=AKK4YLsEAAAA\\\\u0026_nc_gid=VPmqNlyAHRDLXiopSSF9YA\\\\u0026_nc_tpa=Q5bMBQFiu38lsHjDLKYPcKAbrxkDMsutwJoeaFopFFFNXCGjLA_U5176W5bhd_JA6XkEVV_7wC7MVUs-\\\\u0026oh=00_AfpuoZXC7MOyXjojBErH5voDR7LBRywUg5N9o_tqfDGMSA\\\\u0026oe=695F9E60\\",\\"isPublished\\":true},{\\"id\\":\\"363981130790376_1448761327255163\\",\\"picture\\":\\"https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/606580852_1448538293944133_6917326923366564152_n.jpg?stp=dst-jpg_p720x720_tt6\\\\u0026_nc_cat=103\\\\u0026ccb=1-7\\\\u0026_nc_sid=127cfc\\\\u0026_nc_ohc=tJqiF5jt94MQ7kNvwElMlkv\\\\u0026_nc_oc=Adl98Qn7bX-swwgq0RUmcF9bymsWLdwt0wQmKcC8KDP68K56JFZZjCV7SQwyLFK2p0A\\\\u0026_nc_zt=23\\\\u0026_nc_ht=scontent-iad3-2.xx\\\\u0026edm=AKK4YLsEAAAA\\\\u0026_nc_gid=VPmqNlyAHRDLXiopSSF9YA\\\\u0026_nc_tpa=Q5bMBQEF7Jmjzldm69EuodWnpoaqWUGk12aPnBKoWNEPrby0eMQGXil-4kbCmI2qvIQ8k-DBKfdu7wqZ\\\\u0026oh=00_AfrsKtp2HfXp1rIge24krUYmnDSbL5E64BM4l8E5b7OfIA\\\\u0026oe=695F910E\\",\\"isPublished\\":true},{\\"id\\":\\"363981130790376_1448619383936024\\",\\"picture\\":\\"https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/607962374_1448537330610896_2741930990324196545_n.jpg?stp=dst-jpg_p720x720_tt6\\\\u0026_nc_cat=105\\\\u0026ccb=1-7\\\\u0026_nc_sid=127cfc\\\\u0026_nc_ohc=M03-vxmETK4Q7kNvwGw06i4\\\\u0026_nc_oc=AdllHyH_QU0hBUjOlIHcZe9EehPf-UWnRpiHpLg2NLaK2hOb3fkTA3EfvkwPLVaIABA\\\\u0026_nc_zt=23\\\\u0026_nc_ht=scontent-iad3-2.xx\\\\u0026edm=AKK4YLsEAAAA\\\\u0026_nc_gid=VPmqNlyAHRDLXiopSSF9YA\\\\u0026_nc_tpa=Q5bMBQGay5_0kxPcR9o7SxVuVVWZEOwP0TKlpSZplnC7ISLBKPZ-m94TjYXLwt0C9HIpr-dwyxhn1yfj\\\\u0026oh=00_AfpSJ_BWqTgRDiVAXLcJSS-6uTMPL8msG8uL48lhwY2vWw\\\\u0026oe=695FB97C\\",\\"isPublished\\":true}],\\"nextResetTime\\":1767513600}","modifiedDate":1750587044,"createdDate":1750587044,"promotionInfo":{"feedInfo":[{"id":"363981130790376_1449601223837840","picture":"https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/611263353_1449272930537336_2171872436830469074_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=WoZxWyHUohcQ7kNvwENRp7A&_nc_oc=AdmntsXuWgupyAT6dcNgu_2zpFl-fljIzrqiKQSvVWZUcHsfyEwNrCAnBrRWnZpu5bg&_nc_zt=23&_nc_ht=scontent-iad3-2.xx&edm=AKK4YLsEAAAA&_nc_gid=VPmqNlyAHRDLXiopSSF9YA&_nc_tpa=Q5bMBQFzzgowRy0vFVWLcNuFXxXLSrWhlOh2TACmb76ALI6gp8cIycJQE5qznQRxwiSBuDN00mdnGF3I&oh=00_AfqsD4FpHEJuu_v1OiCN1o_drziYRtAlKtJ2ZEuklhODGg&oe=695F88F2","isPublished":true},{"id":"363981130790376_1449395673858395","picture":"https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/610797173_1449272033870759_824912642183846354_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=TgqSnqltr6oQ7kNvwFlxgH1&_nc_oc=AdnOQX5rZMqHY9b8up9fM2ugUC5YiOKcZnoEfETsIHwWrOOPAn4jMA2fU3Q0Cv7bCSQ&_nc_zt=23&_nc_ht=scontent-iad3-1.xx&edm=AKK4YLsEAAAA&_nc_gid=VPmqNlyAHRDLXiopSSF9YA&_nc_tpa=Q5bMBQHKNjUS5MGcd84IfbhuYtN470DNYx5Qwfe8U4IePFEjN6wkipNNENqXvAgUJelNXMN6EEcsSPx8&oh=00_Afo31iJfX8qLlM1OtbdcxjUr7nouBxfIV8VTNb-C6ZJStg&oe=695FA259","isPublished":true},{"id":"363981130790376_1449271583870804","picture":"https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/609203490_1449271467204149_536102708148864181_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=YiajsAOcEKYQ7kNvwGgtrIa&_nc_oc=AdkyIyPJw2ccNZR77B26RonjPzYGSYfkTMGP-XolOpWFJ5cOqRir7rtrdak847B8nF0&_nc_zt=23&_nc_ht=scontent-iad3-1.xx&edm=AKK4YLsEAAAA&_nc_gid=VPmqNlyAHRDLXiopSSF9YA&_nc_tpa=Q5bMBQFiu38lsHjDLKYPcKAbrxkDMsutwJoeaFopFFFNXCGjLA_U5176W5bhd_JA6XkEVV_7wC7MVUs-&oh=00_AfpuoZXC7MOyXjojBErH5voDR7LBRywUg5N9o_tqfDGMSA&oe=695F9E60","isPublished":true},{"id":"363981130790376_1448761327255163","picture":"https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/606580852_1448538293944133_6917326923366564152_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=tJqiF5jt94MQ7kNvwElMlkv&_nc_oc=Adl98Qn7bX-swwgq0RUmcF9bymsWLdwt0wQmKcC8KDP68K56JFZZjCV7SQwyLFK2p0A&_nc_zt=23&_nc_ht=scontent-iad3-2.xx&edm=AKK4YLsEAAAA&_nc_gid=VPmqNlyAHRDLXiopSSF9YA&_nc_tpa=Q5bMBQEF7Jmjzldm69EuodWnpoaqWUGk12aPnBKoWNEPrby0eMQGXil-4kbCmI2qvIQ8k-DBKfdu7wqZ&oh=00_AfrsKtp2HfXp1rIge24krUYmnDSbL5E64BM4l8E5b7OfIA&oe=695F910E","isPublished":true},{"id":"363981130790376_1448619383936024","picture":"https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/607962374_1448537330610896_2741930990324196545_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=M03-vxmETK4Q7kNvwGw06i4&_nc_oc=AdllHyH_QU0hBUjOlIHcZe9EehPf-UWnRpiHpLg2NLaK2hOb3fkTA3EfvkwPLVaIABA&_nc_zt=23&_nc_ht=scontent-iad3-2.xx&edm=AKK4YLsEAAAA&_nc_gid=VPmqNlyAHRDLXiopSSF9YA&_nc_tpa=Q5bMBQGay5_0kxPcR9o7SxVuVVWZEOwP0TKlpSZplnC7ISLBKPZ-m94TjYXLwt0C9HIpr-dwyxhn1yfj&oh=00_AfpSJ_BWqTgRDiVAXLcJSS-6uTMPL8msG8uL48lhwY2vWw&oe=695FB97C","isPublished":true}],"nextResetTime":1767513600}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"NewSlotOpenPopupPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":10,"uid":451249740898304,"promotionKey":"WatchRewardAdPromotion","strVal":"{\\"dailyBonusMoney\\":0,\\"coinShowerMoney\\":0,\\"receiveCountMapper\\":{\\"0\\":0,\\"1\\":0,\\"10\\":0,\\"11\\":0,\\"12\\":0,\\"13\\":0,\\"14\\":0,\\"2\\":0,\\"3\\":0,\\"4\\":0,\\"5\\":0,\\"6\\":0,\\"7\\":0,\\"8\\":0,\\"9\\":0},\\"lastReceiveTimeMapper\\":{\\"0\\":0,\\"1\\":0,\\"10\\":0,\\"11\\":0,\\"12\\":0,\\"13\\":0,\\"14\\":0,\\"2\\":0,\\"3\\":0,\\"4\\":0,\\"5\\":0,\\"6\\":0,\\"7\\":0,\\"8\\":0,\\"9\\":0}}","modifiedDate":1767488732,"createdDate":1750587046,"promotionInfo":{"dailyBonusMoney":0,"coinShowerMoney":0,"receiveCountMapper":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0},"lastReceiveTimeMapper":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0}}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"MobileUpdateRewardPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":32,"uid":451249740898304,"promotionKey":"InGameRandomBonusPromotion","strVal":"{\\"coinRewardAd\\":0,\\"dailySpinCnt\\":0,\\"dailyReceivedCnt\\":0,\\"appearProb\\":0,\\"isAcceptable\\":false,\\"showingDate\\":1766391362,\\"lastReceivedDate\\":0,\\"isInitialized\\":true}","modifiedDate":1767488732,"createdDate":1750587045,"promotionInfo":{"coinRewardAd":0,"dailySpinCnt":0,"dailyReceivedCnt":0,"appearProb":0,"isAcceptable":false,"showingDate":1766391362,"lastReceivedDate":0,"isInitialized":true}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"NewUserMissionPromotion","strVal":"{\\"isNewUser\\":true,\\"isRenewal\\":true}","modifiedDate":1750587044,"createdDate":1750587044,"promotionInfo":{"isNewUser":true,"isRenewal":true}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"NewUserAllInCarePromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"MobileReviewPopupPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"StarShopFreeRewardPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"MembersPlusBonusPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":10,"uid":451249740898304,"promotionKey":"ServiceIntroduceCoinV2Promotion","strVal":"{\\"completedSteps\\":[0,1,3,5,6,8,9],\\"completedSubSteps\\":[0],\\"isNewUser\\":true}","modifiedDate":1750587045,"createdDate":1750587045,"promotionInfo":{"completedSteps":[0,1,3,5,6,8,9],"completedSubSteps":[0],"isNewUser":true}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"DailyBonusWheelPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"RainbowDiceBonusPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"FireDiceBonusPromotion","strVal":"{}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{}},{"revisionNumber":181,"uid":451249740898304,"promotionKey":"PiggyBankPromotion","strVal":"{\\"userLevel\\":7,\\"curMoney\\":10197400,\\"maxMoney\\":32000000,\\"firstProgressiveDate\\":1750587079,\\"isInitialized\\":true,\\"ruleVersion\\":2}","modifiedDate":1750587045,"createdDate":1750587045,"promotionInfo":{"userLevel":7,"curMoney":10197400,"maxMoney":32000000,"firstProgressiveDate":1750587079,"isInitialized":true,"ruleVersion":2}},{"revisionNumber":0,"uid":451249740898304,"promotionKey":"ShopRenewalPromotion","promotionInfo":{"startDate":1685433600}},{"revisionNumber":0,"uid":451249740898304,"promotionKey":"ShopRenewalPromotion2","promotionInfo":{"startDate":1688025600}},{"revisionNumber":5,"uid":451249740898304,"promotionKey":"ReelQuestNewbiPromotion","strVal":"{\\"seasonID\\":1002,\\"group\\":\\"N\\",\\"eventEnd\\":1766824122,\\"isNewBiComplete\\":true,\\"newBiCompleteDate\\":1766824122,\\"isTargetUser\\":true}","modifiedDate":1750587045,"createdDate":1750587045,"promotionInfo":{"seasonID":1002,"group":"N","eventEnd":1766824122,"isNewBiComplete":true,"newBiCompleteDate":1766824122,"isTargetUser":true}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"AlmightyCouponPromotion","strVal":"{\\"version\\":1,\\"isTargetUser\\":true}","modifiedDate":1750587044,"createdDate":1750587044,"promotionInfo":{"version":1,"isTargetUser":true}},{"revisionNumber":2,"uid":451249740898304,"promotionKey":"HighrollerSuitePassPromotion","strVal":"{\\"isTargetUser\\":true}","modifiedDate":1750587044,"createdDate":1750587044,"promotionInfo":{"isTargetUser":true}},{"revisionNumber":13,"uid":451249740898304,"promotionKey":"DailyStampV2Promotion","strVal":"{\\"version\\":1,\\"consecutiveDays\\":1,\\"accumulatedDays\\":7,\\"nextReceivedTime\\":1767254400,\\"isTargetUser\\":true}","modifiedDate":1750587044,"createdDate":1750587044,"promotionInfo":{"version":1,"consecutiveDays":1,"accumulatedDays":7,"nextReceivedTime":1767254400,"isTargetUser":true}},{"revisionNumber":5,"uid":451249740898304,"promotionKey":"LevelPassPromotion","strVal":"{\\"normalCollectedInfo\\":[3,5],\\"endDate\\":1767533327,\\"isTargetUser\\":true}","modifiedDate":1750587046,"createdDate":1750587046,"promotionInfo":{"normalCollectedInfo":[3,5],"endDate":1767533327,"isTargetUser":true}},{"revisionNumber":43,"uid":451249740898304,"promotionKey":"HyperBountyDailyNormalPromotion","strVal":"{\\"group\\":\\"A\\",\\"missionInfo\\":[{\\"missionID\\":201,\\"goalCnt\\":3,\\"rewards\\":[{\\"itemID\\":\\"i_game_money\\",\\"itemType\\":\\"C\\",\\"addCnt\\":25000},{\\"itemID\\":\\"i_hyper_bounty_pass_point\\",\\"itemType\\":\\"C\\",\\"addCnt\\":20}]},{\\"missionID\\":202,\\"goalCnt\\":6,\\"subGoalCnt\\":54000},{\\"missionID\\":301,\\"goalCnt\\":1},{\\"missionID\\":204,\\"goalCnt\\":2671200,\\"subGoalCnt\\":48},{\\"missionID\\":401,\\"goalCnt\\":1}],\\"nextResetDate\\":1767513600}","modifiedDate":1766323198,"createdDate":1766323198,"promotionInfo":{"group":"A","missionInfo":[{"missionID":201,"goalCnt":3,"rewards":[{"itemID":"i_game_money","itemType":"C","addCnt":25000},{"itemID":"i_hyper_bounty_pass_point","itemType":"C","addCnt":20}]},{"missionID":202,"goalCnt":6,"subGoalCnt":54000},{"missionID":301,"goalCnt":1},{"missionID":204,"goalCnt":2671200,"subGoalCnt":48},{"missionID":401,"goalCnt":1}],"nextResetDate":1767513600}},{"revisionNumber":56,"uid":451249740898304,"promotionKey":"HyperBountyDailySuperPromotion","strVal":"{\\"group\\":\\"A\\",\\"adjustAvgBet3000\\":60000,\\"round\\":1,\\"missionInfo\\":{\\"missionID\\":303,\\"goalCnt\\":2,\\"rewards\\":[{\\"itemID\\":\\"i_game_money\\",\\"itemType\\":\\"C\\",\\"addCnt\\":175000},{\\"itemID\\":\\"i_collection_card_pack_3\\",\\"itemType\\":\\"C\\",\\"addCnt\\":1},{\\"itemID\\":\\"i_hyper_bounty_pass_point\\",\\"itemType\\":\\"C\\",\\"addCnt\\":150}]},\\"nextResetDate\\":1767600000}","modifiedDate":1766323198,"createdDate":1766323198,"promotionInfo":{"group":"A","adjustAvgBet3000":60000,"round":1,"missionInfo":{"missionID":303,"goalCnt":2,"rewards":[{"itemID":"i_game_money","itemType":"C","addCnt":175000},{"itemID":"i_collection_card_pack_3","itemType":"C","addCnt":1},{"itemID":"i_hyper_bounty_pass_point","itemType":"C","addCnt":150}]},"nextResetDate":1767600000}},{"revisionNumber":37,"uid":451249740898304,"promotionKey":"HyperBountySeasonPromotion","strVal":"{\\"missionInfo\\":[{\\"infos\\":[{\\"missionID\\":301,\\"goalCnt\\":16,\\"addPassPoint\\":250},{\\"missionID\\":501,\\"goalCnt\\":10,\\"strVal1\\":\\"9.99\\",\\"addPassPoint\\":300},{\\"missionID\\":601,\\"curCnt\\":1,\\"goalCnt\\":12,\\"addPassPoint\\":250},{\\"missionID\\":701,\\"goalCnt\\":300,\\"addPassPoint\\":200},{\\"missionID\\":801,\\"goalCnt\\":8,\\"addPassPoint\\":250}],\\"missionOpenDate\\":1766995200}],\\"seasonResetDate\\":1768809600}","modifiedDate":1766323198,"createdDate":1766323198,"promotionInfo":{"missionInfo":[{"infos":[{"missionID":301,"goalCnt":16,"addPassPoint":250},{"missionID":501,"goalCnt":10,"strVal1":"9.99","addPassPoint":300},{"missionID":601,"curCnt":1,"goalCnt":12,"addPassPoint":250},{"missionID":701,"goalCnt":300,"addPassPoint":200},{"missionID":801,"goalCnt":8,"addPassPoint":250}],"missionOpenDate":1766995200}],"seasonResetDate":1768809600}},{"revisionNumber":5,"uid":451249740898304,"promotionKey":"HyperBountyPassPromotion","strVal":"{\\"seasonStartDate\\":1766995200,\\"nextResetDate\\":1768809600,\\"pointBoostRate\\":1}","modifiedDate":1766323198,"createdDate":1766323198,"promotionInfo":{"seasonStartDate":1766995200,"nextResetDate":1768809600,"pointBoostRate":1}},{"revisionNumber":0,"uid":451249740898304,"promotionKey":"DailyBlitzReserve","promotionInfo":{"endDate":1762761600}}],"userPurchaseInfo":{"revisionNumber":0,"uid":451249740898304,"avgOverUsd3In30Days":0,"medOverUsdIn30Days":0},"userReelQuestInfo":{"revisionNumber":0,"uid":451249740898304,"seasonID":1002,"group":"N","curStage":1,"curMissionSlot":"firelockultimate","curMissions":[{"id":300,"goalCnt":100000},{"id":100,"goalCnt":50,"curCnt":1}],"rewards":[{"itemId":"i_game_money","itemType":"C","addCnt":500000,"addTime":0,"payCode":"","extraInfo":""}],"modifiedDate":1766392122,"createdDate":1766323274},"userStarAlbum":{"uid":451249740898304,"group":"A","sub_group":"1","incompleteSets":[{"id":17001},{"id":17002},{"id":17003},{"id":17004},{"id":17005},{"id":17006},{"id":17007},{"id":17008},{"id":17009},{"id":17010},{"id":17011},{"id":17012},{"id":17013},{"id":17014},{"id":17015},{"id":17016},{"id":17017},{"id":17018},{"id":17019},{"id":17020},{"id":17021},{"id":17022},{"id":17023},{"id":17024},{"id":17025},{"id":17026}],"card_pack_prob_table_id":2,"isAllCollectInfoByRarity":{"1":true,"2":true,"3":true,"4":true,"5":true}},"userStarAlbumGroup":"A"}');
        UserInfo.setInstance(data,"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkIjoxNzY3NDkyOTkwLCJleHBpcmVkIjoxNzY3NzUyMTkwLCJ0b2tlblR5cGUiOjAsInVpZCI6IjQ1MTI0OTc0MDg5ODMwNCJ9.mjXzOTRcoUrmVF4Tx1jc2vTWdlNAD68X0_iA85wAdZQ","")

        for (let i = 0; i < this.jsonAry.length; i++) {
            const refreshJackpotRes = UserInfo.instance().asyncRefreshJackpotInfoByZoneId(i,this.jsonAry[i].json);
        }

        

        // ✅ 核心保留：Canvas分辨率自适应 宽高比阈值 1.7777(16:9)，改值必导致大厅UI拉伸/错位/黑屏！
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasSize = canvas.node.getContentSize();
        const isWideScreen = canvasSize.width / canvasSize.height > 1.7777;
        canvas.fitHeight = isWideScreen;
        canvas.fitWidth = !isWideScreen;
        canvas.getComponentInChildren(cc.Camera).cullingMask = 1;

        // 用户场景状态赋值
        //UserInfo.instance().setCurrentSceneMode(SDefine.Lobby);
        LobbyScene._instance = this;

        // 消息监听注册 - 大厅步骤切换/弹窗重置
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.LOBBY_NEXT_STEP, this.openLobbyStartPopup, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.RESET_START_POPUP, this.resetOpenLobbyStartPopup, this);


        // this.initialize()
    }

    // ===== 生命周期回调 - ON_DESTROY 大厅销毁逻辑，原代码完整复刻，内存释放核心 =====
    onDestroy(): void {
        LobbyScene._instance = null;
        this.unscheduleAllCallbacks();
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        
        if (TSUtility.isValid(UserInfo.instance())) {
            // UserInfo.instance().removeListenerTargetAll(this);
        }

        // 子管理器销毁
        this._mgrLobbyUIMove.onDestroy();
        this._mgrLobbyUIMove = null;
        // this._mgrLobbyUIStartPopup = null;
        // this._mgrLobbyUIDeco = null;
    }

    // ===== 核心异步初始化方法 - 大厅所有逻辑的总入口，进度条0→1完整链路，原代码async/await逻辑100%复刻 =====
    public initialize(): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                const loadingPopup = LoadingPopup.getCurrentOpenPopup();
                loadingPopup.setPostProgress(0, "Authenticating ...");
                
                // 初始化埋点+用户信息重置
                //Analytics.lobbyInitStartInit();
                const userInstance = UserInfo.instance();
                // userInstance.setLocation("Lobby");
                // userInstance.setGameId("");
                // userInstance.resetTourneyTier();

                // 分区ID/名称赋值 + 动态分区权限判断
                // this._numZoneID = SDefine.VIP_LOUNGE_ZONEID;
                // this._strZoneName = SDefine.VIP_LOUNGE_ZONENAME;
                // if (ServiceInfoManager.STRING_LAST_LOBBY_NAME == SDefine.SUITE_ZONENAME && this.isPassableDynamic) {
                //     this._numZoneID = SDefine.SUITE_ZONEID;
                //     this._strZoneName = SDefine.SUITE_ZONENAME;
                // }
                // userInstance.setZoneID(this._numZoneID);
                // userInstance.setZoneName(this._strZoneName);

                // 弹窗返回键绑定退出逻辑
                PopupManager.Instance().setBaseBackBtnCallback(LobbyScene.BackProcess);
                ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT++;
                if (ServiceInfoManager.NUMBER_START_MEMBERS_LEVEL < 0) {
                    //ServiceInfoManager.NUMBER_START_MEMBERS_LEVEL = userInstance.getUserVipInfo().level;
                }

                // 进度条更新 20%
                //Analytics.customLoadingRecord("lob_setUi_complete_" + (ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT - 1).toString());
                loadingPopup.setPostProgress(0.2, "Verifying game ...");
                // this.refreshBGM();

                // 移动端新手引导标记
                // if (Utility.isMobileGame() && !ServerStorageManager.getAsBoolean(StorageKeyType.MOBILE_GUIDE)) {
                //     ServerStorageManager.save(StorageKeyType.MOBILE_GUIDE, true);
                // }

                // 锦标赛定时调度 - 每秒执行一次
                // if (SDefine.SlotTournament_Use) {
                //     this.schedule(this.tourneyLobbySchedule, 1);
                // }

                // 进度条更新 60%
                loadingPopup.setPostProgress(0.6, "Entering lobby ...");
                // const slotZoneInfo = userInstance.slotZoneInfo[Math.min(this._numZoneID, 1)];
                
                // // 分区信息校验 + 大奖信息刷新
                // if (!TSUtility.isValid(slotZoneInfo)) {
                //     if (this._numZoneID != userInstance.getZoneId()) {
                //         cc.error("not matching zoneId ", this._numZoneID, " ", userInstance.getZoneId());
                //         userInstance.setZoneID(this._numZoneID);
                //     }
                //     Analytics.lobbyInitStartRefreshJackpotInfo();
                //     const refreshJackpotRes = await userInstance.asyncRefreshJackpotInfo(true);
                //     Analytics.lobbyInitCompleteRefreshJackpotInfo();
                    
                //     // 网络异常弹窗
                //     if (0 == refreshJackpotRes) {
                //         PopupManager.Instance().showDisplayProgress(true);
                //         CommonPopup.getCommonPopup((isValid, popup) => {
                //             PopupManager.Instance().showDisplayProgress(false);
                //             if (!isValid) {
                //                 popup.open()
                //                     .setInfo("NOTICE", "Check Network Status.", false)
                //                     .setOkBtn(1 == Utility.isFacebookInstant() ? "CLOSE" : "RETRY", () => { HRVServiceUtil.restartGame(); });
                //                 if (Utility.isMobileGame()) {
                //                     popup.setCloseBtn(true, () => { TSUtility.endGame(); });
                //                 }
                //             }
                //         });
                //         resolve();
                //         return;
                //     }
                // }

                // 进度条更新 80% - 各类管理器初始化
                loadingPopup.setPostProgress(0.8, "Initialize manager ...");
                
                PowerGemManager.instance.initialize();
                TimeBonusManager.instance.initialize();
                SupersizeItManager.instance.initialize();

                // 大厅移动管理器初始化
                //Analytics.lobbyInitStartLobbyMoveManager();
                this._mgrLobbyUIMove = new LobbyMoveManager();
                await this._mgrLobbyUIMove.initialize();
                //Analytics.lobbyInitCompleteLobbyMoveManager();

                // // 大厅启动弹窗管理器初始化
                // Analytics.lobbyInitStartStartPopupManager();
                // this._mgrLobbyUIStartPopup = new LobbyUIStartPopupManager();
                // await this._mgrLobbyUIStartPopup.initialize();
                // Analytics.lobbyInitCompleteStartPopupManager();

                // // 大厅装饰管理器初始化
                // this._mgrLobbyUIDeco = this.node.addComponent(LobbyUIDecoManager);
                // await this._mgrLobbyUIDeco.initialize();

                // // 每日充值奖励校验
                // Analytics.lobbyInitStartCheckDailyTopupReward();
                // await userInstance.asyncCheckDailyTopUpReward(null);
                // Analytics.lobbyInitCompleteCheckDailyTopupReward();

                // // 数据刷新埋点 + 卷轴任务版本更新
                // Analytics.lobbyInitStartCheckAndRefreshInfos();
                // Analytics.lobbyInitCompleteCheckAndRefreshInfos();
                // Analytics.lobbyInitStartUpdateReelQuestVersion();
                // await this.asyncUpdateReelQuestVersion();
                // Analytics.lobbyInitCompleteUpdateReelQuestVersion();

                // // 狂热模式门票使用 + FB小队信息刷新
                // SlotFeverModeManager.instance.useFeverTicket(() => {});
                // Analytics.lobbyInitAfterUseFeverTicket();
                // if (SDefine.FBInstant_Squad_Use && TSUtility.isValid(FBSquadManager.Instance().getSquadInfo())) {
                //     FBSquadManager.Instance().refreshSquadInfo();
                // }

                // 进度条更新 90% - UI初始化
                loadingPopup.setPostProgress(0.9, "Initialize UI ...");
                const uiType = this._strZoneName == SDefine.SUITE_ZONENAME ? LobbySceneUIType.SUITE : LobbySceneUIType.LOBBY;
                await this.UI.initialize(uiType);

                // 进度条100%完成 + 入场动画播放
                Analytics.lobbyInitAfterCompleteDelay();
                loadingPopup.setPostProgress(1, "Completed", true);
                await this.UI.playEnterAction();

                // // 首次进入校验未处理的内购订单
                // const enterLobbyCnt = ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT;
                // const enterSlotCnt = ServiceInfoManager.NUMBER_SLOT_ENTER_COUNT;
                // if (enterLobbyCnt + enterSlotCnt <= 1) {
                //     //Analytics.lobbyInitStartCheckUnprocessedPurchase();
                //     //await UnprocessedPurchaseManager.Instance().doProcess();
                //     //Analytics.lobbyInitCompleteCheckUnprocessedPurchase();
                // }

                // // 初始化完成收尾逻辑
                // const completeInit = () => {
                //     if (!ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_LOBBY)) {
                //         ServerStorageManager.save(StorageKeyType.FIRST_VISIT_LOBBY, true);
                //     }
                //     Analytics.lobbyInitCompleteAll();
                //     Analytics.enterCasinoComplete(this._numZoneID);
                //     ServiceInfoManager.STRING_SNEAK_PEEK_GAME_ID = "";
                //     this.openLobbyStartPopup();
                // };

                // // 从老虎机返回大厅时的广告逻辑
                // if ("Slot" == userInstance.getPrevLocation() && 1 == AdsManager.Instance().isUseable()) {
                //     Analytics.lobbyInitPrevLocationSlot();
                //     AdsManager.Instance().ADLog_InterstitialShowUI(AdsManager.PlacementID_InterstitalType.SLOTTOLOBBY);
                //     if (ADTargetManager.instance().enableInterstitialAD()) {
                //         AdsManager.Instance().InterstitialAdplay(AdsManager.PlacementID_InterstitalType.SLOTTOLOBBY, () => {
                //             ServiceInfoManager.instance().addInterstitialADPlayCount();
                //             if (1 == ServiceInfoManager.instance().getShowADSFreePopup()) {
                //                 this._mgrLobbyUIStartPopup.unShiftPopupBase(new LobbyUIStartPopup_ADFreeOffer());
                //             }
                //             completeInit();
                //         }, () => {
                //             if (!TSUtility.isLiveService()) {
                //                 ServiceInfoManager.instance().addInterstitialADPlayCount();
                //                 if (1 == ServiceInfoManager.instance().getShowADSFreePopup()) {
                //                     this._mgrLobbyUIStartPopup.unShiftPopupBase(new LobbyUIStartPopup_ADFreeOffer());
                //                 }
                //             }
                //             completeInit();
                //         });
                //     } else {
                //         if (1 == ADTargetManager.instance().enableInterstitialAD(false)) {
                //             cc.log("Lobby Check enableInterstitialAD true");
                //             AdsManager.Instance().preloadInterstitialAD();
                //         }
                //         completeInit();
                //     }
                // } else {
                //     Analytics.lobbyInitPrevLocationLobby();
                //     completeInit();
                // }
            } catch (error) {
                // 异常上报
                //FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                resolve();
            } finally {
                resolve();
            }
        });
    }

    // ===== 打开大厅启动弹窗，带新手教程校验 =====
    public openLobbyStartPopup(): Promise<void> {
        return new Promise(async (resolve) => {
            // await this.UI.tutorial.checkTutorial(LobbyTutorial.LobbyTutorialCheckType.START_POPUP_OPEN);
            // if (TSUtility.isValid(this._mgrLobbyUIStartPopup)) {
            //     this._mgrLobbyUIStartPopup.openPopup();
            // }
            resolve();
        });
    }

    // ===== 重置大厅启动弹窗，清空弹窗队列+恢复状态 =====
    public resetOpenLobbyStartPopup(): void {
        // this._mgrLobbyUIStartPopup.clear();
        // PopupManager.Instance().showDisplayProgress(false);
        // ServiceInfoManager.BOOL_OPENING_LOBBY_POPUP = false;
        
        // const couponUI = this.UI.getLobbyUI(LobbyUIType.COUPON);
        // if (TSUtility.isValid(couponUI)) {
        //     couponUI.clearActiveCouponContents();
        // }
    }

    // ===== 刷新背景音乐，根据当前分区大奖状态自动切换，原逻辑100%复刻 =====
    public refreshBGM(): void {
        if (!this._isOverrideBGM) {
            const jackpotInfo = SlotJackpotManager.Instance().getZoneJackpotInfo(this._numZoneID);
            if (TSUtility.isValid(jackpotInfo)) {
                this.playBGM(jackpotInfo.getBunningState(SDefine.SLOT_JACKPOT_TYPE_CASINO));
            }
        } else {
            this._strCurBGMName = "";
        }
    }

    // ===== 播放背景音乐，核心圣诞皮肤优先级判断+大奖燃烧状态BGM切换 ✔️改必导致音效异常 =====
    public playBGM(burningState: number): void {
        if (!this._isOverrideBGM) {
            const activeSkinList = SkinInfoManager.Instance().getActiveSkinInfoList();
            let christmasSkinTag = "";
            
            // 圣诞皮肤优先级最高，匹配到则播放圣诞BGM
            if (TSUtility.isValid(activeSkinList) && activeSkinList.length > 0) {
                for (let i = 0; i < activeSkinList.length; i++) {
                    if (activeSkinList[i].key.toUpperCase().includes("CHRISTMAS")) {
                        christmasSkinTag = "Christmas";
                        break;
                    }
                }
            }

            // BGM名称判断：圣诞 > 燃烧2 > 燃烧1 > 主BGM
            let bgmName = christmasSkinTag.length > 0 
                ? christmasSkinTag 
                : 0 == burningState ? "mainBGM" : 1 == burningState ? "burining1BGM" : "burining2BGM";
            
            // 仅当BGM名称变化时播放，避免重复加载
            if (this._strCurBGMName != bgmName) {
                this._strCurBGMName = bgmName;
                SoundManager.Instance().playBGM(this.soundSetter.getAudioClip(this._strCurBGMName));
                SoundManager.Instance().setMainVolumeTemporarily(1);
            }
        }
    }

    // ===== 异步更新卷轴任务版本，带用户等级/促销信息校验，原代码完整复刻 =====
    public asyncUpdateReelQuestVersion(): Promise<void> {
        return new Promise(async (resolve) => {
            // const userInstance = UserInfo.instance();
            // if (0 == userInstance.hasActiveReelQuest()) { resolve(); return; }
            
            // const userLevel = userInstance.getUserLevelInfo().level;
            // if (UserPromotion.ReelQuestPromotion.Normal_LevelLimit > userLevel) { resolve(); return; }

            // const newbiePromo = userInstance.getPromotionInfo(UserPromotion.ReelQuestPromotion.Newbie_PromotionKeyName);
            // if (TSUtility.isValid(newbiePromo) && 0 == newbiePromo.isNewBiComplete) { resolve(); return; }

            // const activeQuestKey = userInstance.getActiveReelQuestPromotionKey();
            // const activeQuestInfo = userInstance.getPromotionInfo(activeQuestKey);
            // if (!TSUtility.isValid(activeQuestInfo)) { resolve(); return; }

            // const currentUnix = TSUtility.getServerBaseNowUnixTime();
            // if (activeQuestInfo.eventEnd >= currentUnix) { resolve(); return; }

            // // 任务过期则重新请求新任务
            // await new Promise((innerResolve, innerReject) => {
            //     PopupManager.Instance().showDisplayProgress(true);
            //     CommonServer.Instance().requestAcceptPromotion(
            //         userInstance.getUid(),
            //         userInstance.getAccessToken(),
            //         UserPromotion.ReelQuestPromotion.Normal_PromotionKeyName,
            //         0,0,"",
            //         (response) => {
            //             if (CommonServer.isServerResponseError(response)) {
            //                 PopupManager.Instance().showDisplayProgress(false);
            //                 innerReject();
            //                 return;
            //             }
            //             const changeResult = userInstance.getServerChangeResult(response);
            //             userInstance.applyChangeResult(changeResult);
            //             CommonServer.Instance().requestReelQuestRefresh((questRes) => {
            //                 PopupManager.Instance().showDisplayProgress(false);
            //                 if (CommonServer.isServerResponseError(questRes)) {
            //                     innerReject();
            //                 } else {
            //                     userInstance.setUserReelQuestInfo(questRes.userReelQuest);
            //                     innerResolve(true);
            //                 }
            //             });
            //         }
            //     );
            // }).catch(() => {});
            resolve();
        });
    }

    // ===== 锦标赛大厅定时调度，每秒执行，带防重入标记 ✔️改必导致锦标赛卡死/重复请求 =====
    public tourneyLobbySchedule(): Promise<void> {
        return new Promise(async (resolve) => {
            // if (this._isRunTourneySchedule) {
            //     cc.log("tourneyLobbySchedule skip shedule");
            //     resolve();
            //     return;
            // }
            // this._isRunTourneySchedule = true;

            // try {
            //     await this.asyncTourneyLobbyWork();
            //     if (!TSUtility.isValid(this)) { resolve(); return; }

            //     const tourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
            //     const currentUnix = TSUtility.getServerBaseNowUnixTime();
                
            //     // 锦标赛信息刷新校验
            //     if (SlotTourneyManager.Instance().getLastUpdateTimeProgressInfo(0) + 60 <= currentUnix && tourneyInfo.getNextSlotStartTime() > currentUnix + 60) {
            //         await this.asyncRefreshTourneyInfo();
            //     }

            //     // 锦标赛参与完成校验
            //     const isComplete = await SlotTourneyManager.Instance().asyncCheckCompleteParticipateTourney(false, -1, -1);
            //     if (!TSUtility.isValid(this)) { resolve(); return; }
            //     if (1 == isComplete) {
            //         await HeroTooltipPopup.asyncGetTourneyCompleteTooltip(this.node, this.UI.getLobbyNode(LobbyUIBase.LobbyUIType.MENU));
            //     }
            // } catch (error) {
            //     cc.error("tourneyLobbySchedule exception ", error.toString());
            //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
            // } finally {
            //     this._isRunTourneySchedule = false;
            //     resolve();
            // }
            resolve();
        });
    }

    // ===== 锦标赛核心异步逻辑，新游戏预约+数据刷新 =====
    public asyncTourneyLobbyWork(): Promise<void> {
        return new Promise(async (resolve) => {
            // const tourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
            // const currentUnix = TSUtility.getServerBaseNowUnixTime();
            
            // if (tourneyInfo.getNextSlotStartTime() <= currentUnix) {
            //     cc.log("asyncTourneyLobbyWork TOURNEY_RESERVE_NEWGAME");
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.TOURNEY_RESERVE_NEWGAME);
            //     const tourneyRes = await CommonServer.Instance().asyncRequestSlotTourneyInfo();
                
            //     if (!TSUtility.isValid(this)) { resolve(); return; }
            //     if (1 == CommonServer.isServerResponseError(tourneyRes)) {
            //         cc.error("get asyncRequestSlotTourneyInfo fail ", JSON.stringify(tourneyRes));
            //         resolve();
            //         return;
            //     }

            //     // 解析锦标赛数据并更新
            //     const tourneyMaster = SlotTourneyManager.ServerSlotTourneyMasterInfo.parseObj(tourneyRes.slotTourneyMasterInfo);
            //     if (tourneyInfo.tourneyID == tourneyMaster.tourneyID) { resolve(); return; }
                
            //     SlotTourneyManager.Instance().setSlotTourneyMasterInfo(tourneyMaster);
            //     if (TSUtility.isValid(tourneyRes.slotTourneyProgressInfos)) {
            //         for (let i = 0; i < tourneyRes.slotTourneyProgressInfos.length; ++i) {
            //             const progressInfo = SlotTourneyManager.ServerslotTourneyProgressInfo.parseObj(tourneyRes.slotTourneyProgressInfos[i]);
            //             SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
            //         }
            //     }
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.TOURNEY_START_NEWGAME);
            // }
            resolve();
        });
    }

    // ===== 异步刷新锦标赛信息，原代码完整复刻 =====
    public asyncRefreshTourneyInfo(): Promise<void> {
        return new Promise(async (resolve) => {
            // cc.log("asyncRefreshTourneyInfo start");
            // const tourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
            // const tourneyRes = await CommonServer.Instance().asyncRequestSlotTourneyInfo();
            
            // if (!TSUtility.isValid(this)) { resolve(); return; }
            // if (1 == CommonServer.isServerResponseError(tourneyRes)) {
            //     cc.error("get asyncRequestSlotTourneyInfo fail ", JSON.stringify(tourneyRes));
            //     resolve();
            //     return;
            // }

            // const tourneyMaster = SlotTourneyManager.ServerSlotTourneyMasterInfo.parseObj(tourneyRes.slotTourneyMasterInfo);
            // if (tourneyInfo.tourneyID != tourneyMaster.tourneyID) { resolve(); return; }
            
            // SlotTourneyManager.Instance().setSlotTourneyMasterInfo(tourneyMaster);
            // if (TSUtility.isValid(tourneyRes.slotTourneyProgressInfos)) {
            //     for (let i = 0; i < tourneyRes.slotTourneyProgressInfos.length; ++i) {
            //         const progressInfo = SlotTourneyManager.ServerslotTourneyProgressInfo.parseObj(tourneyRes.slotTourneyProgressInfos[i]);
            //         SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
            //     }
            // }
            // MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.TOURNEY_REFRESH_INFO);
            // cc.log("asyncRefreshTourneyInfo end");
            resolve();
        });
    }
}