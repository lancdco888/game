import DialogBase, { DialogState } from "../../../Script/DialogBase";
import FireHoseSender, { FHLogType } from "../../../Script/FireHoseSender";
import TSUtility from "../../../Script/global_utility/TSUtility";
import PopupManager from "../../../Script/manager/PopupManager";
import MessageRoutingManager from "../../../Script/message/MessageRoutingManager";
import { CommonRewardActionType, CommonRewardButtonType, CommonRewardTitleInfo } from "./CommonRewardEnum";
import CommonRewardResources from "./CommonRewardResources";

const { ccclass, property } = cc._decorator;

// ===================== 顶部导入所有外部模块 =====================
// import FireHoseSender from "../../../global_utility/Network/FireHoseSender";
// import MessageRoutingManager from "../../Utility/MessageRoutingManager";
// import TSUtility from "../../../global_utility/TSUtility";
// import DialogBase, { DialogState } from "../../../slot_common/Script/Popup/DialogBase";
// import PopupManager from "../../../slot_common/Script/Popup/PopupManager";
// import * as CommonRewardEnum from "./CommonRewardEnum";
// import * as CommonRewardPopupInfo from "./CommonRewardPopupInfo";
// import CommonRewardResources from "./CommonRewardResources";

// // 导入所有奖励信息子类
// import CommonRewardInfo_DailyBlast from "./Info/CommonRewardInfo_DailyBlast";
// import CommonRewardInfo_DailyBlitz from "./Info/CommonRewardInfo_DailyBlitz";
// import CommonRewardInfo_DailyStamp from "./Info/CommonRewardInfo_DailyStamp";
// import CommonRewardInfo_Inbox from "./Info/CommonRewardInfo_Inbox";
// import CommonRewardInfo_LevelUpPass from "./Info/CommonRewardInfo_LevelUpPass";
// import CommonRewardInfo_Normal from "./Info/CommonRewardInfo_Normal";
// import CommonRewardInfo_PowerGem from "./Info/CommonRewardInfo_PowerGem";
// import CommonRewardInfo_ReelQuest from "./Info/CommonRewardInfo_ReelQuest";
// import CommonRewardInfo_RewardCenterTimeBonus from "./Info/CommonRewardInfo_RewardCenterTimeBonus";
// import CommonRewardInfo_ShareReward from "./Info/CommonRewardInfo_ShareReward";
// import CommonRewardInfo_SlotCardPackReward from "./Info/CommonRewardInfo_SlotCardPackReward";
// import CommonRewardInfo_StarAlbumShop from "./Info/CommonRewardInfo_StarAlbumShop";
// import CommonRewardInfo_SuiteLeagueShop from "./Info/CommonRewardInfo_SuiteLeagueShop";
// import CommonRewardInfo_SingleResult from "./Info/CommonRewardInfo_SingleResult";
// import CommonRewardInfo_WelcomeBack from "./Info/CommonRewardInfo_WelcomeBack";
// import CommonRewardInfo_Spin2Win from "./Info/CommonRewardInfo_Spin2Win";
// import CommonRewardInfo_HyperBounty from "./Info/CommonRewardInfo_HyperBounty";
// import CommonRewardInfo_ClubReward from "./Info/CommonRewardInfo_ClubReward";

// 类型别名（简化代码）
type RewardAction = any; // 奖励动作类型（根据项目实际类型替换）
type RewardInfo = any;   // 奖励信息基类（根据项目实际类型替换）
type ChangeResult = any; // 服务器变更结果类型（根据项目实际类型替换）
type RewardTitleInfo = CommonRewardTitleInfo;
type RewardButtonType = CommonRewardButtonType;

/**
 * 通用奖励弹窗核心组件
 * 功能：统一管理所有类型的奖励展示、动画播放、弹窗生命周期
 */
@ccclass()
export default class CommonRewardPopup extends DialogBase {
    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _resource: CommonRewardResources = null;       // 奖励弹窗资源管理组件
    private _arrAction: RewardAction[] = [];                // 奖励动作数组
    private _curAction: RewardAction = null;                // 当前执行的奖励动作
    public closeCallback: Function = null;                  // 弹窗关闭回调
    public isBlurBackScreen: boolean = false;               // 是否模糊背景

    // ===================== 静态方法（弹窗实例获取） =====================
    /**
     * 获取奖励弹窗实例（异步加载资源）
     * @param callback 加载完成回调 (error: Error, popup: CommonRewardPopup)
     */
    public static getPopup(callback: (error: Error, popup: CommonRewardPopup) => void): void {
        const resPath = "Service/00_Common/CommonRewardPopup/CommonRewardPopup";
        
        // 加载弹窗预制体资源
        cc.loader.loadRes(resPath, (error: Error, prefab: cc.Prefab) => {
            if (error) {
                // 资源加载失败，记录异常日志
                const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg));
                
                if (callback) {
                    callback(error, null);
                }
                return;
            }

            // 资源加载成功，创建实例
            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(CommonRewardPopup);
                popupNode.active = false;
                
                callback(null, popupComp);
            }
        });
    }

    // ===================== 生命周期方法 =====================
    /**
     * 初始化弹窗（继承自DialogBase）
     */
    public initialize(): void {
        this.initDailogBase(); // 初始化弹窗基类
        
        // 获取资源管理组件
        this._resource = this.node.getComponent(CommonRewardResources);
        
        // 设置弹窗容器尺寸适配Canvas
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (TSUtility.isValid(canvas)) {
            this._resource.getNodePool().node.setContentSize(canvas.node.getContentSize());
        }
    }

    // ===================== 核心业务方法 =====================
    /**
     * 打开奖励弹窗（通用入口）
     * @param changeResult 服务器变更结果
     * @param titleInfo 标题信息
     * @param buttonType 按钮类型
     * @param rewardInfo 奖励信息配置
     * @param isShowProgress 是否显示进度
     * @returns 当前弹窗实例
     */
    public open(
        changeResult: ChangeResult,
        titleInfo: RewardTitleInfo = null,
        buttonType: RewardButtonType = CommonRewardButtonType.NONE,
        rewardInfo: any = null,
        isShowProgress: boolean = true
    ): CommonRewardPopup | null {
        // 校验变更结果有效性
        if (!TSUtility.isValid(changeResult)) {
            return null;
        }

        // 获取对应类型的奖励信息处理器
        const rewardInfoHandler = this.getRewardInfo(rewardInfo);
        if (!TSUtility.isValid(rewardInfoHandler)) {
            return null;
        }

        // 获取奖励动作数组
        const actionArray = rewardInfoHandler.getActionArray(changeResult, rewardInfo, buttonType, titleInfo, isShowProgress);
        
        // 播放弹窗打开动画和奖励动作
        this.playOpenPopup(rewardInfoHandler, actionArray);
        
        return this;
    }

    /**
     * 打开单结果奖励弹窗（专用入口）
     * @param changeResult 服务器变更结果
     * @param titleInfo 标题信息
     * @param buttonType 按钮类型
     * @param rewardInfo 奖励信息配置
     * @returns 当前弹窗实例
     */
    public openSingleResult(
        changeResult: ChangeResult,
        titleInfo: RewardTitleInfo = null,
        buttonType: RewardButtonType = CommonRewardButtonType.NONE,
        rewardInfo: any = null
    ): CommonRewardPopup | null {
        // 获取对应类型的奖励信息处理器
        const rewardInfoHandler = this.getRewardInfo(rewardInfo);
        if (!TSUtility.isValid(rewardInfoHandler)) {
            return null;
        }

        // 获取单结果奖励动作数组
        const actionArray = rewardInfoHandler.getActionSingle(changeResult, rewardInfo, buttonType, titleInfo);
        
        // 播放弹窗打开动画和奖励动作
        this.playOpenPopup(rewardInfoHandler, actionArray);
        
        return this;
    }

    /**
     * 播放弹窗打开动画和奖励动作序列
     * @param rewardInfoHandler 奖励信息处理器
     * @param actionArray 奖励动作数组
     */
    public async playOpenPopup(rewardInfoHandler: RewardInfo, actionArray: RewardAction[]): Promise<void> {
        // 无动作序列时直接关闭弹窗
        if (actionArray.length <= 0) {
            this.close();
            return;
        }

        // 初始化弹窗
        this.initialize();
        
        // 显示遮罩和加载进度
        PopupManager.Instance().showBlockingBG(true);
        PopupManager.Instance().showDisplayProgress(true);

        try {
            // 获取处理后的奖励动作数组
            this._arrAction = await this._resource.getRewardActionArray(actionArray, rewardInfoHandler);
            
            // 无处理后的动作时关闭弹窗
            if (this._arrAction.length <= 0) {
                this.close();
                return;
            }

            // 隐藏加载状态
            PopupManager.Instance().showBlockingBG(false);
            PopupManager.Instance().showDisplayProgress(false);

            // 打开弹窗
            this._open(null);
            
            // 隐藏奖励节点池
            this._resource.getNodePool().Hide();
            
            // 播放弹窗打开动画
            rewardInfoHandler.playOpenAction(this._resource);

            // 依次执行所有奖励动作
            for (let i = 0; i < this._arrAction.length; i++) {
                // 结束当前动作（如果存在）
                if (TSUtility.isValid(this._curAction)) {
                    this._resource.getNodePool().Hide();
                    this._curAction.endAction();
                    this._curAction = null;
                }

                // 获取当前动作
                this._curAction = this._arrAction[i];
                if (!TSUtility.isValid(this._curAction)) {
                    continue;
                }

                // 设置背景遮罩状态
                this.blockingBG.active = !this.isDisableBlockScreen();
                
                // 播放当前奖励动作
                await this._curAction.playAction();
            }

            // 所有动作执行完成后关闭弹窗
            this.close();
        } catch (error) {
            console.error("播放奖励动作失败:", error);
            this.close();
        }
    }

    /**
     * 判断是否禁用屏幕遮罩
     * @returns 是否禁用遮罩
     */
    private isDisableBlockScreen(): boolean {
        // 当前无动作时不禁用遮罩
        if (!TSUtility.isValid(this._curAction)) {
            return false;
        }

        // 获取动作信息
        const actionInfo = this._curAction.getRewardActionInfo();
        if (!TSUtility.isValid(actionInfo)) {
            return false;
        }

        // 获取动作参数
        const actionParam = actionInfo.getActionParam();
        if (!TSUtility.isValid(actionParam) || !TSUtility.isValid(actionParam.param)) {
            return false;
        }

        const param = actionParam.param;
        const actionType = actionInfo.getActionType();

        // 指定动作类型且立即使用时禁用遮罩
        switch (actionType) {
            case CommonRewardActionType.EMOJI:
            case CommonRewardActionType.DRAGON:
            case CommonRewardActionType.LUCKY_STRIKE_WHEEL:
            case CommonRewardActionType.PIGGY_BANK:
            case CommonRewardActionType.FLIP_A_COIN:
            case CommonRewardActionType.PIGGIES_IN_LADDERS:
                return TSUtility.isValid(param.isImmediateUse) && param.isImmediateUse === 1;
            
            default:
                return false;
        }
    }

    /**
     * 检查奖励信息类型
     * @param targetType 目标类型
     * @param instance 实例对象
     * @returns 是否匹配类型
     */
    private checkRewardInfoType(targetType: any, instance: any): boolean {
        return instance instanceof targetType;
    }

    /**
     * 后退按钮处理（继承自DialogBase）
     * @returns 处理结果
     */
    public onBackBtnProcess(): boolean {
        return true;
    }

    /**
     * 关闭弹窗（核心方法）
     */
    public close(): void {
        // 已关闭状态不重复处理
        if (this.isStateClose()) {
            return;
        }

        // 发送UI刷新消息
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_LOBBY_UI);
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_INGAME_UI);

        // 清空定时器
        this.unscheduleAllCallbacks();

        // 设置弹窗状态为关闭
        this.setState(DialogState.Close);
        
        // 清理资源
        this.clear();
        
        // 执行弹窗关闭逻辑
        this.ClosePopup();
        
        // 播放关闭动画
        this._close(cc.fadeOut(0.15));
    }

    /**
     * 弹窗关闭具体逻辑
     */
    public ClosePopup(): void {
        // 执行关闭回调
        if (this.closeCallback !== null) {
            this.closeCallback();
            this.closeCallback = null;
        }

        // 重置背景模糊状态
        this.isBlurBackScreen = false;
        
        // 隐藏截图
        PopupManager.Instance().hideScreenShot();

        // 延迟隐藏节点池
        this.scheduleOnce(() => {
            if (TSUtility.isValid(this._resource)) {
                this._resource.getNodePool().Hide();
            }
        }, 0.15);
    }

    /**
     * 获取对应类型的奖励信息处理器
     * @param rewardInfo 奖励信息配置
     * @returns 奖励信息处理器实例
     */
    private getRewardInfo(rewardInfo: any): RewardInfo {
        // 无配置时返回默认处理器
        if (!TSUtility.isValid(rewardInfo)) {
            return new CommonRewardInfo_Normal();
        }

        // 根据配置类型返回对应处理器
        if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_SingleResult, rewardInfo)) {
            return new CommonRewardInfo_SingleResult();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_DailyStamp, rewardInfo)) {
            return new CommonRewardInfo_DailyStamp();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_InBox, rewardInfo)) {
            return new CommonRewardInfo_Inbox();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_SuiteLeagueShop, rewardInfo)) {
            return new CommonRewardInfo_SuiteLeagueShop();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_StarAlbumShop, rewardInfo)) {
            return new CommonRewardInfo_StarAlbumShop();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_ReelQuest, rewardInfo)) {
            return new CommonRewardInfo_ReelQuest();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_ShareReward, rewardInfo)) {
            return new CommonRewardInfo_ShareReward();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_DailyBlitz, rewardInfo)) {
            return new CommonRewardInfo_DailyBlitz();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_DailyBlast, rewardInfo)) {
            return new CommonRewardInfo_DailyBlast();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_SlotCardPackReward, rewardInfo)) {
            return new CommonRewardInfo_SlotCardPackReward();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_LevelUpPass, rewardInfo)) {
            return new CommonRewardInfo_LevelUpPass();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_PowerGem, rewardInfo)) {
            return new CommonRewardInfo_PowerGem();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_RewardCenterTimeBonus, rewardInfo)) {
            return new CommonRewardInfo_RewardCenterTimeBonus();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_WelcomeBack, rewardInfo)) {
            return new CommonRewardInfo_WelcomeBack();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_Spin2Win, rewardInfo)) {
            return new CommonRewardInfo_Spin2Win();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_HyperBounty, rewardInfo)) {
            return new CommonRewardInfo_HyperBounty();
        } else if (this.checkRewardInfoType(CommonRewardPopupInfo.CommonRewardPopupInfo_Club_Reward, rewardInfo)) {
            return new CommonRewardInfo_ClubReward();
        } else {
            // 默认返回普通奖励处理器
            return new CommonRewardInfo_Normal();
        }
    }

    /**
     * 清理资源（可重写）
     */
    public clear(): void {
        // 子类可实现具体的清理逻辑
        this._arrAction = [];
        this._curAction = null;
        this._resource = null;
    }
}