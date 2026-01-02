const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import PopupManager from "../manager/PopupManager";
import UserInfo from "../User/UserInfo";
import UserPromotion, { JiggyPuzzlePromotion } from "../User/UserPromotion";
//import JiggyPuzzleMainPopup from "../../JiggyPrizes/JiggyPuzzleMainPopup";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";

@ccclass
export default class RewardCenterMainButton_JiggyPrize extends RewardCenterMainButton {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，3个核心按钮，直接拖拽绑定) ======================
    @property(cc.Button)
    private btnCollect: cc.Button = null;

    @property(cc.Button)
    private btnPlayNow: cc.Button = null;

    @property(cc.Button)
    private btnGoNow: cc.Button = null;

    // ====================== 重写父类抽象方法 - 返回当前按钮类型【必须重写，父类核心识别标识】 ======================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.JIGGY_PRIZE;
    }

    // ====================== 静态校验方法 (全局通用，类直接调用，原JS核心业务逻辑1:1精准还原，无任何修改) ======================
    /** 静态方法：判断是否可领取拼图奖励 - 核心拼图碎片校验逻辑 */
    public static isCanReceive(): boolean {
        if (!this.isUseable()) return false;
        
        // 获取拼图活动的推广配置信息
        const promotionInfo = UserInfo.instance().getPromotionInfo(JiggyPuzzlePromotion.PromotionKeyName);
        if (!TSUtility.isValid(promotionInfo)) return false;
        
        // 已完成所有关卡 → 不可领取
        if (promotionInfo.isCompleteAllStage() === 1) return false;

        // 核心计算：当前拥有的拼图碎片数 >= 拼图空位数量 → 可领取
        const curPieceCnt = JiggyPuzzlePromotion.curPieceCnt;
        let emptyPieceCount = 0;
        for (let i = 0; i < promotionInfo.curBoard.length; i++) {
            if (promotionInfo.curBoard[i] === 0) emptyPieceCount++;
        }
        return curPieceCnt >= emptyPieceCount;
    }

    /** 静态方法：判断当前按钮是否可用 - 三层前置校验规则完整保留 */
    public static isUseable(): boolean {
        const promotionInfo = UserInfo.instance().getPromotionInfo(JiggyPuzzlePromotion.PromotionKeyName);
        // 校验1: 拼图活动配置有效  校验2: 拼图活动已开启  校验3: 当前存在有效关卡
        return TSUtility.isValid(promotionInfo) && promotionInfo.isAvailable() !== 0 && promotionInfo.curStage !== 0;
    }

    // ====================== 重写父类保护方法 - 组件初始化【只执行一次，绑定所有按钮事件，无重复绑定风险】 ======================
    protected _initialize(): void {
        // 绑定3个按钮的点击事件，对应各自的回调方法
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_JiggyPrize", "onClick_Collect", ""));
        this.btnPlayNow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_JiggyPrize", "onClick_PlayNow", ""));
        this.btnGoNow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_JiggyPrize", "onClick_GoNow", ""));
    }

    // ====================== 重写父类保护方法 - 实例化校验【供父类自动调用，统一校验逻辑】 ======================
    /** 实例方法：是否可领取奖励 → 内部调用静态校验方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_JiggyPrize.isCanReceive();
    }

    /** 实例方法：按钮是否可用 → 内部调用静态校验方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_JiggyPrize.isUseable();
    }

    // ====================== 重写父类保护方法 - UI刷新钩子【父类updateView自动调用，核心三按钮动态显隐逻辑】 ======================
    protected _updateUI(): void {
        const promotionInfo = UserInfo.instance().getPromotionInfo(JiggyPuzzlePromotion.PromotionKeyName);
        if (TSUtility.isValid(promotionInfo)) {
            // 分支1: 已完成所有拼图关卡 → 只显示【Go Now】按钮
            if (promotionInfo.isCompleteAllStage() === 1) {
                this.btnGoNow.node.active = true;
                this.btnCollect.node.active = false;
                this.btnPlayNow.node.active = false;
            } else {
                // 分支2: 未完成关卡 → 隐藏【Go Now】，根据领取状态切换【Collect/Play Now】
                this.btnGoNow.node.active = false;
                this.btnCollect.node.active = this._isCanReceive();
                this.btnPlayNow.node.active = !this._isCanReceive();
            }
        }
    }

    // ====================== 核心公共方法 - 打开拼图主弹窗【所有按钮点击的统一跳转逻辑，原JS核心方法完整保留】 ======================
    public openJiggyPuzzleMainPopup(): void {
        const self = this;
        // 前置校验：按钮是否可用
        if (this._isUseable()) {
            // 显示全局加载中遮罩层
            PopupManager.Instance().showDisplayProgress(true);
            
            // // 加载并打开拼图主弹窗
            // JiggyPuzzleMainPopup.getPopup((err: Error, popup: JiggyPuzzleMainPopup) => {
            //     // 关闭加载遮罩
            //     PopupManager.Instance().showDisplayProgress(false);
            //     if (!err) {
            //         // 打开弹窗 + 设置关闭回调：刷新当前按钮视图状态，保证数据同步
            //         popup.open();
            //         popup.setCloseCallback(() => {
            //             self.updateView();
            //         });
            //     }
            // });
        } else {
            // 按钮不可用的兜底逻辑：刷新视图状态，防止界面卡死
            this.updateView();
        }
    }

    // ====================== 三个按钮的点击事件回调【均调用统一弹窗逻辑，原JS逻辑完全一致】 ======================
    public onClick_Collect(): void {
        this.openJiggyPuzzleMainPopup();
    }

    public onClick_PlayNow(): void {
        this.openJiggyPuzzleMainPopup();
    }

    public onClick_GoNow(): void {
        this.openJiggyPuzzleMainPopup();
    }
}