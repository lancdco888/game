import FireHoseSender, { FHLogType } from "./FireHoseSender";
import LoginProcess from "./LoginProcess";
import Analytics from "./Network/Analytics";
import CommonServer from "./Network/CommonServer";
import CommonPopup from "./Popup/CommonPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import State from "./Slot/State";
import SlotBannerInfo from "./SlotBannerInfo";
import UserInfo from "./User/UserInfo";
import { WelcomeBonusPromotion } from "./User/UserPromotion";
import EntrancePathManager from "./global_utility/EntrancePathManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import ServerStorageManager, { StorageKeyType } from "./manager/ServerStorageManager";
import { SlotTourneyTierType } from "./manager/SlotTourneyManager";

const { ccclass, property } = cc._decorator;

/**
 * 下一场景信息设置状态类
 * 负责登录后根据多维度条件（落地Slot、欢迎奖励、测试模式、FB锦标赛、用户VIP/登录间隔等）选择下一个要进入的场景（Slot/Lobby），并持久化Zone信息
 */
@ccclass()
export default class L_SetNextSceneInfoState extends State {
    /**
     * 启动场景信息设置流程
     */
    public onStart(): void {
        this._done = false;
        this.doProcess();
    }

    /**
     * 核心处理流程
     */
    public async doProcess(): Promise<void> {
        // 初始化埋点
        //Analytics.setNextSceneInfoStart();

        // 1. 检查欢迎奖励是否未领取
        // const welcomeBonusInfo = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName);
        // const isWelcomeBonusUnreceived = TSUtility.isValid(welcomeBonusInfo) && welcomeBonusInfo.isReceived === 0;

        // 2. 选择下一场景信息
        const nextSceneInfo = JSON.parse('{"sceneName":"L_Lobby","isGoToSlot":false,"tourneyTier":-1,"tourneyID":0,"zoneID":0,"zoneName":"HighRoller"}');
        //await this.selectNextSceneInfo(isWelcomeBonusUnreceived);

        // 3. 初始化小游戏信息 + 持久化Zone信息
        //MinigameManager.instance().createMiniGameInfo();
        ServerStorageManager.save(StorageKeyType.LAST_ZONE_ID, nextSceneInfo.zoneID);
        ServerStorageManager.save(StorageKeyType.LAST_ZONE_NAME, nextSceneInfo.zoneName);

        // 4. 更新用户信息 + 登录流程场景配置
        // UserInfo.instance().setZoneID(nextSceneInfo.zoneID);
        // UserInfo.instance().setZoneName(nextSceneInfo.zoneName);
        LoginProcess.Instance().setNextScene(
            nextSceneInfo.zoneID,
            nextSceneInfo.sceneName,
            nextSceneInfo.isGoToSlot,
            nextSceneInfo.tourneyID,
            nextSceneInfo.tourneyTier
        );

        // 5. 完成埋点 + 标记状态结束
        //Analytics.setNextSceneInfoComplete();
        this.setDone();
    }

    /**
     * 选择下一场景信息（优先Slot，失败则返回Lobby）
     * @param isWelcomeBonusUnreceived 欢迎奖励是否未领取
     * @returns 下一场景信息
     */
    private async selectNextSceneInfo(isWelcomeBonusUnreceived: boolean): Promise<any> {
        // 1. 尝试获取Slot场景信息
        const slotSceneInfo = await this.asyncGetSlotSceneInfo(isWelcomeBonusUnreceived);

        // 2. 非Slot场景直接返回Lobby
        if (slotSceneInfo.isGoToSlot !== true) {
            return this.getLobbySceneInfo();
        }

        // 3. 非正式环境直接返回Slot场景
        if (!TSUtility.isLiveService()) {
            return slotSceneInfo;
        }

        // 4. 正式环境校验Slot是否可用（请求Zone信息）
        const zoneInfoRes = await CommonServer.Instance().requestZoneInfo(
            // UserInfo.instance().getUid(),
            // UserInfo.instance().getAccessToken()
        );

        // Zone信息请求失败 → 返回Lobby
        if (CommonServer.isServerResponseError(zoneInfoRes)) {
            cc.error("requestZoneInfo error");
            return this.getLobbySceneInfo();
        }

        // 校验Slot是否在可用列表中
        const zoneInfo = zoneInfoRes.zoneInfo;
        const targetSlotInfo = SDefine.getSlotSceneInfoBySceneName(slotSceneInfo.sceneName);
        let isSlotAvailable = false;

        for (const slotItem of zoneInfo.slotList) {
            const slotBannerInfo = new SlotBannerInfo();
            slotBannerInfo.parseObj(slotItem);

            // SlotID匹配且非提前访问Slot → 可用
            if (slotBannerInfo.strSlotID === targetSlotInfo.gameId && !slotBannerInfo.isEarlyAccessSlot) {
                isSlotAvailable = true;
                break;
            }
        }

        // Slot可用则返回，否则记录日志并返回Lobby
        if (isSlotAvailable) {
            return slotSceneInfo;
        }

        cc.error("unavailable slot");
        const error = new Error(
            `selectNextSceneInfo check slot info fail. [slot:${slotSceneInfo.sceneName}][zone:${slotSceneInfo.zoneID.toString()}]`
        );
        FireHoseSender.Instance().sendAws(
            FireHoseSender.Instance().getRecord(FHLogType.Trace, error),
            true,
            FHLogType.Trace
        );

        return this.getLobbySceneInfo();
    }

    /**
     * 异步获取Slot场景信息（多分支条件判断）
     * @param isWelcomeBonusUnreceived 欢迎奖励是否未领取
     * @returns Slot场景信息
     */
    private async asyncGetSlotSceneInfo(isWelcomeBonusUnreceived: boolean): Promise<any> {
        const landingSlotId = EntrancePathManager.Instance().getLandingSlotId();

        // 分支1：存在落地SlotID（优先处理）
        if (landingSlotId !== "") {
            // const couponID = UserInfo.instance().getCouponID();
            // cc.log("landingSlot", landingSlotId, couponID);

            // // 有优惠券则先显示奖励弹窗
            // if (couponID !== "") {
            //     await this.asyncShowRewardPopup(couponID);
            // }

            // 确定落地ZoneID/ZoneName
            const landingZoneId = EntrancePathManager.Instance().getLandingZoneId();
            let targetZoneID = SDefine.HIGHROLLER_ZONEID;
            let targetZoneName = SDefine.HIGHROLLER_ZONENAME;

            // 落地ZoneID有效则使用，否则默认VIP Lounge
            if (landingZoneId.isFind && SDefine.isValidZoneId(landingZoneId.value)) {
                targetZoneID = landingZoneId.value;
                targetZoneName = SDefine.getZoneName(targetZoneID);
            } else {
                targetZoneID = SDefine.VIP_LOUNGE_ZONEID;
                targetZoneName = SDefine.VIP_LOUNGE_ZONENAME;
            }

            // 校验Zone访问权限，无权限则回退到HighRoller
            if (!UserInfo.instance().isPassAbleCasino(targetZoneID, targetZoneName)) {
                cc.log("isPassAbleCasino false", targetZoneID, targetZoneName);
                targetZoneID = SDefine.HIGHROLLER_ZONEID;
                targetZoneName = SDefine.HIGHROLLER_ZONENAME;
            }

            cc.log("landingSlot result", landingSlotId, targetZoneID, targetZoneName);
            const slotSceneInfo = SDefine.getSlotSceneInfo(landingSlotId);

            return {
                sceneName: slotSceneInfo.sceneName,
                isGoToSlot: true,
                tourneyTier: SlotTourneyTierType.INVALID,
                tourneyID: 0,
                zoneID: targetZoneID,
                zoneName: targetZoneName
            };
        }

        // 分支2：欢迎奖励未领取 → 教程Slot
        if (isWelcomeBonusUnreceived) {
            ServiceInfoManager.BOOL_TUTORIAL_COME_IN = true;
            ServiceInfoManager.BOOL_NEWBIE = true;
            const tutorialSlotInfo = SDefine.getSlotSceneInfo(SDefine.TUTORIAL_SLOTID);

            return {
                sceneName: tutorialSlotInfo.sceneName,
                isGoToSlot: true,
                tourneyTier: SlotTourneyTierType.INVALID,
                tourneyID: 0,
                zoneID: SDefine.HIGHROLLER_ZONEID,
                zoneName: SDefine.HIGHROLLER_ZONENAME
            };
        }

        // 分支3：测试模式（指定Slot场景）
        if (TSUtility.isTestAbleSeverMode() && ServiceInfoManager.STRING_TEST_SLOT_SCENE_NAME !== "") {
            return {
                sceneName: ServiceInfoManager.STRING_TEST_SLOT_SCENE_NAME,
                isGoToSlot: true,
                tourneyTier: SlotTourneyTierType.INVALID,
                tourneyID: 0,
                zoneID: SDefine.HIGHROLLER_ZONEID,
                zoneName: SDefine.HIGHROLLER_ZONENAME
            };
        }

        // 分支4：直接Slot测试模式
        if (TSUtility.isTestDirectSlotMode()) {
            const testSlotInfo = SDefine.getSlotSceneInfo(TSUtility.TestDirectSlot);

            return {
                sceneName: testSlotInfo.sceneName,
                isGoToSlot: true,
                tourneyTier: SlotTourneyTierType.INVALID,
                tourneyID: 0,
                zoneID: SDefine.HIGHROLLER_ZONEID,
                zoneName: SDefine.HIGHROLLER_ZONENAME
            };
        }

        // // 分支5：FB Instant锦标赛模式
        // if (Utility.isFacebookInstant() && SDefine.FBInstant_Tournament_Use) {
        //     const tourneyInfo = await FBInstantUtil.asyncGetTournamentInfo();

        //     if (tourneyInfo.isJoinTournament()) {
        //         const currentTourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
        //         const tourneySlotInfo = SDefine.getSlotSceneInfo(currentTourneyInfo.curSlotID);

        //         if (tourneySlotInfo) {
        //             // 标记新手/教程状态
        //             if (isWelcomeBonusUnreceived) {
        //                 ServiceInfoManager.BOOL_TUTORIAL_COME_IN = true;
        //                 ServiceInfoManager.BOOL_NEWBIE = true;
        //             }

        //             // 计算锦标赛Tier（根据用户金币）
        //             const userTotalCoin = UserInfo.instance().getTotalCoin();
        //             let targetTourneyTier = SlotTourneyTierType.GREEN;

        //             for (let tier = 0; tier < SlotTourneyTierType.MAX; ++tier) {
        //                 if (SlotTourneyManager.Instance().enableJoinGame(tier, userTotalCoin) === 1) {
        //                     targetTourneyTier = tier;
        //                     break;
        //                 }
        //             }

        //             return {
        //                 sceneName: tourneySlotInfo.sceneName,
        //                 isGoToSlot: true,
        //                 tourneyTier: targetTourneyTier,
        //                 tourneyID: currentTourneyInfo.tourneyID,
        //                 zoneID: SDefine.HIGHROLLER_ZONEID,
        //                 zoneName: SDefine.HIGHROLLER_ZONENAME
        //             };
        //         }

        //         cc.error("invalid tourneyMaterInfo.curSlotID", currentTourneyInfo.curSlotID);
        //     }
        // }

        // 分支6：无Slot场景 → 返回空（后续走Lobby逻辑）
        return {
            sceneName: "",
            isGoToSlot: false,
            tourneyTier: SlotTourneyTierType.INVALID,
            tourneyID: 0,
            zoneID: SDefine.HIGHROLLER_ZONEID,
            zoneName: SDefine.HIGHROLLER_ZONENAME
        };
    }

    /**
     * 获取Lobby场景信息（根据用户VIP/登录间隔/门票等条件动态调整Zone）
     * @returns Lobby场景信息
     */
    private getLobbySceneInfo(): any {
        // 基础数据获取
        const userLastLoginGap = UserInfo.instance().getUserLastLoginGapDate();
        let targetZoneID = ServerStorageManager.getAsNumber(StorageKeyType.LAST_ZONE_ID);
        let targetZoneName = ServerStorageManager.getAsString(StorageKeyType.LAST_ZONE_NAME);

        // 规则1：VIP等级生效/长时间未登录 → VIP Lounge
        // const userVipInfo = UserInfo.instance().getUserVipInfo();
        const userLastLoginDate = UserInfo.instance().getUserLastLoginDate();
        
        // if (userVipInfo.issueDate > userLastLoginDate - userLastLoginGap && userVipInfo.level > 0) {
        //     targetZoneID = SDefine.VIP_LOUNGE_ZONEID;
        //     targetZoneName = SDefine.VIP_LOUNGE_ZONENAME;
        // } else if (userLastLoginGap >= 129600 && userVipInfo.level > 0) {
        //     targetZoneID = SDefine.VIP_LOUNGE_ZONEID;
        //     targetZoneName = SDefine.VIP_LOUNGE_ZONENAME;
        // }

        // // 规则2：无历史ZoneID → 根据VIP/门票判断
        // else if (targetZoneID < 0) {
        //     if (UserInfo.instance().hasMajorRollerFreeTicket() === 1 || userVipInfo.level > 0) {
        //         targetZoneID = SDefine.VIP_LOUNGE_ZONEID;
        //         targetZoneName = SDefine.VIP_LOUNGE_ZONENAME;
        //     } else {
        //         targetZoneID = SDefine.HIGHROLLER_ZONEID;
        //         targetZoneName = Utility.isFacebookInstant() 
        //             ? SDefine.LIGHTNING_ZONENAME 
        //             : SDefine.HIGHROLLER_ZONENAME;
        //     }
        // }

        // // 规则3：历史ZoneID过高且无门票/VIP → 回退到HighRoller
        // else if (targetZoneID > SDefine.HIGHROLLER_ZONEID 
        //     && UserInfo.instance().hasMajorRollerFreeTicket() === 0 
        //     && userVipInfo.level < 1) {
        //     targetZoneID = SDefine.HIGHROLLER_ZONEID;
        //     targetZoneName = Utility.isFacebookInstant() 
        //         ? SDefine.LIGHTNING_ZONENAME 
        //         : SDefine.HIGHROLLER_ZONENAME;
        // }

        // 规则4：Suite Zone需VIP7+或有效Suite Pass → 否则回退到VIP Lounge
        if (targetZoneName === SDefine.SUITE_ZONENAME ) {
            const suitePassItems = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.ITEM_SUITE_PASS);
            let isSuitePassValid = false;

            if (suitePassItems.length > 0) {
                const passExpireTime = suitePassItems[0].expireDate - TSUtility.getServerBaseNowUnixTime();
                isSuitePassValid = passExpireTime > 0;
            }

            if (!isSuitePassValid) {
                targetZoneID = SDefine.VIP_LOUNGE_ZONEID;
                targetZoneName = SDefine.VIP_LOUNGE_ZONENAME;
            }
        }

        // 规则5：ZoneID超过VIP Lounge → 强制回退
        if (SDefine.VIP_LOUNGE_ZONEID < targetZoneID) {
            targetZoneID = SDefine.VIP_LOUNGE_ZONEID;
            targetZoneName = SDefine.VIP_LOUNGE_ZONENAME;
        }

        // 返回Lobby场景信息
        return {
            sceneName: "L_Lobby",
            isGoToSlot: false,
            tourneyTier: SlotTourneyTierType.INVALID,
            tourneyID: 0,
            zoneID: targetZoneID,
            zoneName: targetZoneName
        };
    }

    /**
     * 异步显示分享奖励弹窗
     * @param couponID 优惠券ID
     */
    private async asyncShowRewardPopup(couponID: string): Promise<void> {
        // 清空优惠券ID（避免重复领取）
        // UserInfo.instance().setCouponID("");

        // 请求领取分享奖励
        const rewardRes = await CommonServer.Instance().asyncRequestAcceptShareReward(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            couponID
        );

        // 奖励请求失败 → 显示错误弹窗
        if (CommonServer.isServerResponseError(rewardRes)) {
            let errorCode = 0;
            if (TSUtility.isValid(rewardRes.errorCode)) errorCode = rewardRes.errorCode;
            if (TSUtility.isValid(rewardRes.error) && TSUtility.isValid(rewardRes.error.code)) {
                errorCode = rewardRes.error.code;
            }
            await this.asyncShowRewardErrorPopup(errorCode);
            return;
        }

        // 处理奖励结果并显示弹窗
        const serverChangeResult = UserInfo.instance().getServerChangeResult(rewardRes);
        cc.log("show Reward popup");

        await new Promise<void>((resolve) => {
            // ShareRewardPopup.getPopup((error: any, popup: any) => {
            //     if (error !== null) {
            //         UserInfo.instance().applyChangeResult(serverChangeResult);
            //         resolve();
            //         return;
            //     }
            //     popup.open(serverChangeResult);
            //     popup.setCloseCallback(() => resolve());
            // });
        });
    }

    /**
     * 异步显示奖励错误弹窗
     * @param errorCode 错误码
     */
    private async asyncShowRewardErrorPopup(errorCode: number): Promise<void> {
        // const errorMsg = ShareRewardPopup.getErrorMsg(errorCode);
        // cc.log("show Reward Error popup");

        // await new Promise<void>((resolve) => {
        //     CommonPopup.getCommonPopup((error: any, popup: any) => {
        //         if (error !== null) {
        //             resolve();
        //             return;
        //         }
        //         popup.open()
        //             .setInfo("", errorMsg)
        //             .setOkBtn("OK", null);
        //         popup.setCloseCallback(() => resolve());
        //     });
        // });
    }
}