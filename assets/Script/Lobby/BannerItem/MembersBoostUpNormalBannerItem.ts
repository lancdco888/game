import CommonBannerItem from "../../BannerItem/CommonBannerItem";
import GameCommonSound from "../../GameCommonSound";
import MembersClassBoostUpNormalManager from "../../ServiceInfo/MembersClassBoostUpNormalManager";
import TSUtility from "../../global_utility/TSUtility";
import PopupManager from "../../manager/PopupManager";

const { ccclass, property } = cc._decorator;


/**
 * 会员等级提升（普通版）横幅组件
 * 继承自通用横幅基类，负责显示提升剩余时间、Boosted等级图标，点击打开提升弹窗
 */
@ccclass('MembersBoostUpNormalBannerItem')
export default class MembersBoostUpNormalBannerItem extends CommonBannerItem {
    // ===== 序列化组件属性 =====
    /** 剩余时间显示标签 */
    @property(cc.Label)
    public remainTimeLabel: cc.Label | null = null;

    /** Boosted等级图标列表 */
    @property({ type: [cc.Node] })
    public listBoostedIcon: cc.Node[] = [];

    /** 是否为大厅横幅 */
    @property
    public isLobbyBanner: boolean = false;

    // ===== 生命周期方法 =====
    /**
     * 组件加载时初始化
     * - 调用父类onLoad
     * - 检查是否在运行等级扩展流程，若是则初始化Boosted信息+定时更新剩余时间
     */
    public onLoad(): void {
        // 调用父类onLoad方法
        super.onLoad?.();

        // 检查是否正在运行会员等级提升扩展流程
        const boostUpManager = MembersClassBoostUpNormalManager.instance();
        if (boostUpManager.isRunningMembersBoostUpExpandProcess()) {
            // 设置Boosted等级图标显示
            this.setShowBoostedInfo();
            // 立即更新剩余时间
            this.updateRemainTimeSchedule();
            // 每1秒定时更新剩余时间
            this.schedule(this.updateRemainTimeSchedule, 1);
        }
    }

    // ===== 核心业务逻辑 =====
    /**
     * 定时更新剩余时间
     * - 获取剩余时间+促销信息，时间≤0则销毁节点
     * - 格式化剩余时间并显示
     */
    public updateRemainTimeSchedule(): void {
        // 获取剩余时间（秒）
        // const remainTime = MembersClassBoostUpNormalManager.instance().getRemainTime();
        // // 获取会员等级提升扩展促销信息
        // const promotionInfo = UserInfo.instance().getPromotionInfo(
        //     UserPromotion.MembersClassBoostUpExpandPromotion.PromotionKeyName
        // ) as MembersClassBoostUpExpandPromotionInfo;

        // // 校验促销信息有效性
        // if (!TSUtility.default.isValid(promotionInfo)) return;

        // // 剩余时间≤0：销毁节点+触发弹窗关闭回调
        // if (remainTime <= 0) {
        //     this.node.removeFromParent();
        //     this.node.destroy();
        //     this.onPopupClose?.();
        //     return;
        // }

        // // 格式化剩余时间并显示
        // const timeFormatter = new TimeFormatHelper(remainTime);
        // if (this.remainTimeLabel) {
        //     this.remainTimeLabel.string = timeFormatter.getTimeStringDayBaseHourFormatBigNoneSpace();
        // }
    }

    /**
     * 按钮点击事件处理
     * 1. 播放通用按钮音效
     * 2. 显示加载进度，异步获取并打开会员等级提升弹窗
     */
    public onClickBtn(): void {
        // 播放"btn_etc"音效（一次）
        GameCommonSound.playFxOnce("btn_etc");

        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(false);

        // // 异步获取会员等级提升弹窗实例
        // MembersBoostUpNormalPopup.default.getPopup((err: Error | null | undefined, popup: MembersBoostUpNormalPopup) => {
        //     // 隐藏加载进度
        //     PopupManager.Instance().showDisplayProgress(false);
            
        //     // 无错误则打开弹窗（原代码e || t.open() 等价于 !err && popup.open()）
        //     if (!err && popup) {
        //         popup.open();
        //     }
        // });
    }

    /**
     * 设置Boosted等级图标显示
     * - 获取提升后的会员等级，计算图标索引并显示对应图标
     */
    public setShowBoostedInfo(): void {
        // 获取提升后的会员等级
        const boostedLevel = MembersClassBoostUpNormalManager.instance().getBoostedMembersClass();

        // 先隐藏所有Boosted图标
        this.listBoostedIcon.forEach(iconNode => {
            if (iconNode) iconNode.active = false;
        });

        // 计算图标索引（等级-4），显示对应图标
        const iconIndex = boostedLevel - 4;
        const targetIcon = this.listBoostedIcon[iconIndex];
        if (TSUtility.isValid(targetIcon)) {
            targetIcon.active = true;
        }
    }
}