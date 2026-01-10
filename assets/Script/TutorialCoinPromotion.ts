import CommonServer from "./Network/CommonServer";
import CoinToTargetEffect from "./Popup/CoinToTargetEffect";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";
import { NewServiceIntroduceCoinPromotion } from "./User/UserPromotion";
import PopupManager from "./manager/PopupManager";
import MessageRoutingManager from "./message/MessageRoutingManager";

// Cocos Creator 2.x 标准头部解构写法 (严格按你的要求，置顶)
const { ccclass, property } = cc._decorator;


export type INTRODUCE_MAIN = typeof TutorialCoinPromotion.INTRODUCE_MAIN[keyof typeof TutorialCoinPromotion.INTRODUCE_MAIN];

// ================= 数据结构定义 =================
/** 引导信息结构 */
export interface IntroduceInfo {
    mainType: typeof TutorialCoinPromotion.INTRODUCE_MAIN.NONE;
    nodeCoin: Node | null;
    coinType: string;
    callBack: (() => void) | null;
}

/**
 * 教程金币奖励组件（TutorialCoinPromotion）
 * 负责教程引导中的金币奖励领取、网络请求、金币动画播放、状态同步
 */
@ccclass()
export default class TutorialCoinPromotion extends cc.Component {
    // ================= 枚举定义 =================
    /** 引导主类型 */
    public static readonly INTRODUCE_MAIN = {
        MAIN_SHOP: 0,
        BONUS: 1,
        STARALBUM: 2,
        INBOX: 3,
        FRIEND: 4,
        PROFILE: 5,
        VIP: 6,
        VIP_LOUNGE: 7,
        PAY_TABLE_IN_GAME: 8,
        BANKROLL_INGAME: 9,
        END_INDEX: 10,
        NONE: 999
    } as const;

    /** 引导子类型 */
    public static readonly INTRODUCE_SUB = {
        VIPPLUS_BONUS: 0,
        FULL_SCREEN: 1,
        INBOX_CONNECT: 2,
        FRIEND_CONNECT: 3,
        PROFILE_CONNECT: 4
    } as const;
  

    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Button)
    public targetButton: cc.Button | null = null; // 奖励领取按钮

    @property(cc.Node)
    public coinNode: cc.Node | null = null; // 金币动画起始节点

    @property
    public isMain: boolean = true; // 是否为主引导类型

    @property
    public coin_Type: string = ""; // 金币类型（对应引导类型字符串）

    // ================= 生命周期函数 =================
    onLoad() {
        // 原代码空实现，保留以兼容子类扩展
    }

    // ================= 核心业务逻辑 =================
    /**
     * 领取金币奖励
     * @param isFirst  是否为首次领取（默认true）
     */
    public onCollect(isFirst: boolean = true): void {
        // 记录当前引导名称 + 禁用领取按钮
        ServiceInfoManager.STRING_CURRENT_INTRODUCE_NAME = this.coin_Type;
        this.getComponent(cc.Button).enabled = false;

        // 解析引导类型（main/sub）和对应的枚举值
        let introType: number = 0;
        let introCategory: "main" | "sub" = "main";

        // 主引导类型映射
        switch (this.coin_Type) {
            case "MAIN_SHOP":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.MAIN_SHOP;
                introCategory = "main";
                break;
            case "BONUS":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.BONUS;
                introCategory = "main";
                break;
            case "STARALBUM":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.STARALBUM;
                introCategory = "main";
                break;
            case "INBOX":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.INBOX;
                introCategory = "main";
                break;
            case "FRIEND":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.FRIEND;
                introCategory = "main";
                break;
            case "PROFILE":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.PROFILE;
                introCategory = "main";
                break;
            case "VIP":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.VIP;
                introCategory = "main";
                break;
            case "VIP_LOUNGE":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.VIP_LOUNGE;
                introCategory = "main";
                break;
            case "PAYTABLE_INGAME":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.PAY_TABLE_IN_GAME;
                introCategory = "main";
                break;
            case "BANKROLL_INGAME":
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.BANKROLL_INGAME;
                introCategory = "main";
                break;
            // 子引导类型映射
            case "VIPPLUS_BONUS":
                introType = TutorialCoinPromotion.INTRODUCE_SUB.VIPPLUS_BONUS;
                introCategory = "sub";
                break;
            case "FULLSCREEN":
                introType = TutorialCoinPromotion.INTRODUCE_SUB.FULL_SCREEN;
                introCategory = "sub";
                break;
            case "INBOX_CONNECT":
                introType = TutorialCoinPromotion.INTRODUCE_SUB.INBOX_CONNECT;
                introCategory = "sub";
                break;
            case "FRIEND_CONNECT":
                introType = TutorialCoinPromotion.INTRODUCE_SUB.FRIEND_CONNECT;
                introCategory = "sub";
                break;
            case "PROFILE_CONNECT":
                introType = TutorialCoinPromotion.INTRODUCE_SUB.PROFILE_CONNECT;
                introCategory = "sub";
                break;
            default:
                introType = TutorialCoinPromotion.INTRODUCE_MAIN.NONE;
                introCategory = "main";
                break;
        }

        // 主引导类型：显示加载进度
        if (introCategory === "main") {
            PopupManager.Instance().showDisplayProgress(true);
        }

        // 请求领取奖励
        CommonServer.Instance().requestAcceptPromotion(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            NewServiceIntroduceCoinPromotion.PromotionKeyName,
            introType,
            isFirst ? 0 : 1,
            introCategory,
            (response) => {
                // 网络请求失败：隐藏加载进度
                if (CommonServer.isServerResponseError(response)) {
                    PopupManager.Instance().showDisplayProgress(false);
                    return;
                }

                // 发送引导事件 + 处理奖励结果
                MessageRoutingManager.instance().emitMessage(
                    MessageRoutingManager.MSG.BLOCK_EVENT_SERVICEINTRODUCECOIN,
                    this.coin_Type
                );

                const changeResult = UserInfo.instance().getServerChangeResult(response);
                const totalChangeCoin = changeResult.getTotalChangeCoin();

                // 有金币奖励：播放金币动画
                if (totalChangeCoin > 0) {
                    const preCoin = UserInfo.instance().getTotalCoin();
                    UserInfo.instance().applyChangeResult(changeResult);
                    const curCoin = UserInfo.instance().getTotalCoin();

                    // 金币增加：播放动画
                    if (preCoin < curCoin) {
                        CoinToTargetEffect.playEffectToMyCoin(
                            this.coinNode,
                            preCoin,
                            curCoin,
                            totalChangeCoin,
                            () => {
                                // 动画结束：发送更新事件 + 隐藏节点
                                MessageRoutingManager.instance().emitMessage(
                                    MessageRoutingManager.MSG.UPDATE_SERVICE_INTRODUCE_COIN,
                                    this.coin_Type
                                );
                                PopupManager.Instance().showDisplayProgress(false);
                                this.node.active = false;
                            }
                        );
                    }
                } else {
                    // 无金币奖励：直接更新状态 + 隐藏节点
                    PopupManager.Instance().showDisplayProgress(false);
                    UserInfo.instance().applyChangeResult(changeResult);
                    this.node.active = false;
                }
            }
        );
    }
}
