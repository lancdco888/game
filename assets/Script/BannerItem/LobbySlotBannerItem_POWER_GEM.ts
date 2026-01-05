// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import PowerGemManager from "../manager/PowerGemManager";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

/**
 * 大厅 POWER_GEM 专属横幅组件
 * 继承通用大厅横幅基类，核心功能：宝石活动倒计时展示、固定6个活动格子的初始化与数据刷新、活动结束自动销毁、时间更新回调的订阅/释放
 */
@ccclass
export default class LobbySlotBannerItem_POWER_GEM extends LobbySlotBannerItem {
    // ===================== 常量定义【原代码完整保留】 =====================
    private readonly MAX_COUNT: number = 6;

    // ===================== 序列化绑定属性【与原代码一致，顺序不变】 =====================
    @property(cc.Prefab)
    public prefab: cc.Prefab = null!;

    @property(cc.Label)
    public lblTime: cc.Label = null!;

    @property(cc.Layout)
    public layout: cc.Layout = null!;

    // ===================== 私有成员变量【原代码完整保留】 =====================
    private _arrSlotItem: SlotBannerItem[] = [];

    // ===================== 生命周期 - 初始化方法【父类继承重写，原逻辑完整保留】 =====================
    public initialize(): void {
        // 订阅宝石管理器的时间更新回调，绑定当前实例的刷新方法
        PowerGemManager.instance.addUpdateTimeFunc(this.updateRemainEventTime.bind(this));
        
        // 循环创建6个横幅子项并加入布局容器
        for (let i = 0; i < this.MAX_COUNT; ++i) {
            this._arrSlotItem.push(this.createSlotBanner(this.prefab, this.layout.node));
        }
    }

    // ===================== 核心业务方法 - 数据刷新【父类继承重写，原逻辑完整保留】 =====================
    public refresh(): void {
        // 空值校验：当前横幅数据有效时才执行刷新
        if (TSUtility.isValid(this.info)) {
            const slotBannerArr = this.info.arrSlotBanner;
            // 遍历6个子项，有数据则赋值，无数据则传null
            for (let i = 0; i < this.MAX_COUNT; ++i) {
                const slotItem = this._arrSlotItem[i];
                if (TSUtility.isValid(slotItem)) {
                    this.setSlotBannerInfo(i < slotBannerArr.length ? slotBannerArr[i] : null, slotItem);
                }
            }
        }
    }

    // ===================== 生命周期 - 组件销毁【原逻辑完整保留，内存安全核心】 =====================
    public onDestroy(): void {
        // 必须取消时间更新回调的订阅，防止内存泄漏 & 空指针报错
        PowerGemManager.instance.removeUpdateTimeFunc(this.updateRemainEventTime.bind(this));
    }

    // ===================== 核心回调方法 - 活动剩余时间更新【原逻辑完整保留，业务核心】 =====================
    public updateRemainEventTime(remainTime: number): void {
        if (remainTime > 0) {
            // 剩余时间>0：格式化时间并赋值到文本标签 (天/时/分 大格式)
            if (TSUtility.isValid(this.lblTime)) {
                this.lblTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(remainTime);
            }
        } else {
            // 剩余时间<=0：活动结束，执行完整的清理逻辑
            if (TSUtility.isValid(this.node)) {
                this.unscheduleAllCallbacks(); // 清空所有定时器
                PowerGemManager.instance.removeUpdateTimeFunc(this.updateRemainEventTime.bind(this)); // 二次取消订阅，双重保险
                this.remove(); // 调用父类方法，移除当前横幅组件
            }
        }
    }
}