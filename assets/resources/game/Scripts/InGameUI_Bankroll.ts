import PlayAniOnActiveCurrentNode from "../../../Script/BigWinEffect/PlayAniOnActiveCurrentNode";
import GameCommonSound from "../../../Script/GameCommonSound";
import HRVSlotService from "../../../Script/HRVService/HRVSlotService";
import ChangeNumberComponent from "../../../Script/Slot/ChangeNumberComponent";
import UserInfo, { MSG } from "../../../Script/User/UserInfo";
import MessageRoutingManager from "../../../Script/message/MessageRoutingManager";
import InGameBankRollPromotionUI from "./InGameBankRollPromotionUI";

const { ccclass, property } = cc._decorator;

/**
 * 游戏内资金UI组件（InGameUI_Bankroll）
 * 负责资金相关按钮点击、金币数值动画、弹窗打开、事件监听与清理
 */
@ccclass()
export default class InGameUI_Bankroll extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Button)
    public btnBankroll: cc.Button = null; // 资金按钮

    @property(cc.Button)
    public btnShop: cc.Button = null; // 商店按钮

    @property(cc.Button)
    public btnCoin: cc.Button = null; // 金币按钮

    @property(cc.Button)
    public btnSale: cc.Button = null; // 售卖按钮

    @property(ChangeNumberComponent)
    public myCoinChangeNumber: ChangeNumberComponent = null; // 金币数值变化组件

    @property(cc.Node)
    public nodeCoinIcon: cc.Node = null; // 金币图标节点（动画目标）

    // ================= 核心业务逻辑 =================
    /**
     * 获取金币动画目标节点
     * @returns 金币图标节点
     */
    public getCoinTarget(): cc.Node {
        return this.nodeCoinIcon;
    }

    // ================= 生命周期函数 =================
    onLoad() {
        if (!this.btnShop || !this.btnSale || !this.btnCoin || !this.btnBankroll || !this.myCoinChangeNumber) {
            cc.log("InGameUI_Bankroll: 部分按钮/数值组件未配置");
            return;
        }

        // 绑定按钮点击事件
        this.btnShop.node.on("click", this.onClick_Shop, this);
        this.btnSale.node.on("click", this.onClick_Shop, this);
        this.btnCoin.node.on("click", this.onClick_Shop, this);
        this.btnBankroll.node.on("click", this.onClick_Coin, this);

        // 初始化金币数值
        this.myCoinChangeNumber.setCurrentNumber(UserInfo.instance().getTotalCoin());

        // 监听资产更新事件：播放金币数值变化动画
        UserInfo.instance().addListenerTarget(
            MSG.UPDATE_ASSET,
            () => {
                const currentNum = this.myCoinChangeNumber!.getCurrentNumber();
                const newNum = UserInfo.instance().getTotalCoin();

                if (newNum > currentNum) {
                    // 金币增加：播放数值变化动画
                    this.myCoinChangeNumber!.playChangeNumber(currentNum, newNum, null, 0.7);
                } else {
                    // 金币未增加：停止动画并直接更新数值
                    this.myCoinChangeNumber!.stopChangeNumber();
                    this.myCoinChangeNumber!.setCurrentNumber(UserInfo.instance().getTotalCoin());
                }
            },
            this
        );

        // 监听引导金币更新事件
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.UPDATE_SERVICE_INTRODUCE_COIN,
            this.updateServiceintroduce.bind(this),
            this
        );
    }

    onDestroy() {
        // 移除所有事件监听，避免内存泄漏
        UserInfo.instance().removeListenerTargetAll(this);
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    // ================= 按钮控制 =================
    /**
     * 隐藏所有资金相关按钮
     */
    public hideAllButton(): void {
        this.btnShop && (this.btnShop.node.active = false);
        this.btnCoin && (this.btnCoin.node.active = false);
        this.btnSale && (this.btnSale.node.active = false);
        this.btnBankroll && (this.btnBankroll.node.active = false);
    }

    /**
     * 克隆节点后清理事件/组件（静态方法）
     * @param targetComp 目标组件实例
     */
    public static clearEvent_AfterCloneItem(targetComp: InGameUI_Bankroll): void {
        const targetNode = targetComp.node;

        // 禁用所有子节点的Button组件
        targetNode.getComponentsInChildren(cc.Button).forEach((btn) => {
            btn.enabled = false;
        });

        // 停止并禁用所有子节点的Animation组件
        targetNode.getComponentsInChildren(cc.Animation).forEach((ani) => {
            ani.stop();
            ani.enabled = false;
            ani.playOnLoad = false;
        });

        // 禁用PlayAniOnActiveCurrentNode组件
        targetNode.getComponentsInChildren(PlayAniOnActiveCurrentNode).forEach((aniComp) => {
            aniComp.enabled = false;
        });

        // 移除当前组件和促销UI组件
        targetNode.removeComponent(InGameUI_Bankroll);
        targetNode.removeComponent(InGameBankRollPromotionUI);
    }

    // ================= 按钮点击回调 =================
    /**
     * 商店/金币/售卖按钮点击回调
     */
    public onClick_Shop(): void {
        // 播放商店按钮音效
        GameCommonSound.playFxOnce("btn_shop");
        // 打开资金弹窗
        this.openPopup();
    }

    /**
     * 资金按钮点击回调
     */
    public onClick_Coin(): void {
        // 播放商店按钮音效
        GameCommonSound.playFxOnce("btn_shop");
        // 打开资金弹窗
        this.openPopup();
    }

    /**
     * 引导金币更新事件回调（未实现，抛错提示）
     */
    public updateServiceintroduce(): void {
        cc.error("InGameUI_Bankroll: updateServiceintroduce 方法未实现");
    }

    /**
     * 打开资金相关弹窗
     */
    public openPopup(): void {
        const inGameUI = HRVSlotService.instance().getInGameUI();
        if (inGameUI) {
            inGameUI.onClickBankRollBtn();
        } else {
            cc.log("InGameUI_Bankroll: 未获取到游戏内UI实例，无法打开资金弹窗");
        }
    }
}