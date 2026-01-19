const { ccclass, property } = cc._decorator;

// ===================== 导入所有依赖模块 - 路径与原JS完全一致 精准无偏差 =====================
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import ServiceInfoManager from "../ServiceInfoManager";
import ServiceSlotDataManager, { SlotBannerFrameType } from "../manager/ServiceSlotDataManager";
import SlotJackpotManager from "../manager/SlotJackpotManager";
import LobbySlotBannerInfo, { SlotBannerType } from "../LobbySlotBannerInfo";
import SlotBannerItem from "../SlotBannerItem";
import { Utility } from "../global_utility/Utility";

// ===================== 联动横幅核心数据模型 - 原JS构造函数 完美转为TS标准类 导出供外部复用 =====================
export class LinkedDisplayInfo {
    public strLinkedKey: string = "";          // 联动唯一标识Key
    public infoLeftBanner: any = null;         // 左侧老虎机横幅信息
    public infoRightBanner: any = null;        // 右侧老虎机横幅信息
    public eFrameType: SlotBannerFrameType = SlotBannerFrameType.BLUE; // 边框类型
    public numIndex: number = 0;               // 展示排序索引
}

// ✅ 核心修复: 自定义Component组件 空@ccclass() 无类名 → 彻底根治类名指定报错
@ccclass()
export default class LobbyBannerLinkedInfo extends cc.Component {
    // ===================== 序列化配置属性 - 与原JS完全一致 拖拽赋值 可视化编辑 =====================
    @property({ type: cc.Prefab, displayName: "老虎机横幅预制体" })
    public prefab: cc.Prefab = null!;

    @property({ type: cc.Node, displayName: "左侧横幅节点容器" })
    public nodeLeftBanner: cc.Node = null!;

    @property({ type: cc.Node, displayName: "右侧横幅节点容器" })
    public nodeRightBanner: cc.Node = null!;

    @property({ type: cc.Label, displayName: "中间巨型大奖金额标签" })
    public lblCenterJackpot: cc.Label = null!;

    @property({ type: cc.Label, displayName: "左侧主要大奖金额标签" })
    public lblLeftJackpot: cc.Label = null!;

    @property({ type: cc.Label, displayName: "右侧主要大奖金额标签" })
    public lblRightJackpot: cc.Label = null!;

    // ===================== 私有成员变量 - 补全精准TS类型标注 原JS逻辑完整复刻 =====================
    private _info: LinkedDisplayInfo = null;          // 联动横幅核心数据
    private _numPrevLeftJackpotMoney: number = 0;            // 左侧大奖上一帧金额(平滑过渡用)
    private _numPrevRightJackpotMoney: number = 0;           // 右侧大奖上一帧金额(平滑过渡用)
    private _numPrevCenterJackpotMoney: number = 0;          // 中间大奖上一帧金额(平滑过渡用)
    private _itemBanner_1: SlotBannerItem = null;     // 左侧横幅实例
    private _itemBanner_2: SlotBannerItem = null;     // 右侧横幅实例

    // ===================== 核心初始化方法 - 联动横幅数据加载+预制体创建+调度启动 原JS逻辑1:1复刻 =====================
    public initialize(info: LinkedDisplayInfo): void {
        this.node.active = true;
        this._info = info;

        // 实例化左右横幅预制体 (单例创建 避免重复实例化)
        if (!TSUtility.isValid(this._itemBanner_1)) {
            this._itemBanner_1 = this.createSlotBanner(this.prefab, this.nodeLeftBanner);
        }
        if (!TSUtility.isValid(this._itemBanner_2)) {
            this._itemBanner_2 = this.createSlotBanner(this.prefab, this.nodeRightBanner);
        }

        // 清空所有调度 防止残留 → 启动大奖金额定时刷新 → 延迟刷新节点显隐状态
        this.unscheduleAllCallbacks();
        this.schedule(this.updateJackpotMoney, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);
        // this.scheduleOnce(this.updateDisplayNode, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);

        // // 初始化左右横幅数据
        this.setSlotBannerInfo(info.infoLeftBanner, this._itemBanner_1);
        this.setSlotBannerInfo(info.infoRightBanner, this._itemBanner_2);

        // 激活横幅的大奖金额显示
        this._itemBanner_1.setActiveAllJackpot();
        this._itemBanner_2.setActiveAllJackpot();
    }

    // ===================== 节点显隐控制 - 隐藏「即将上线」的老虎机横幅 原JS逻辑完全复刻 =====================
    private updateDisplayNode(): void {
        if (!this._info) return;
        // 判断是否为即将上线老虎机 → 是则隐藏对应横幅节点
        this.nodeLeftBanner.active = ServiceInfoManager.instance.isComingSoonSlot(this._info.infoLeftBanner.strSlotID) === 0;
        this.nodeRightBanner.active = ServiceInfoManager.instance.isComingSoonSlot(this._info.infoRightBanner.strSlotID) === 0;
    }

    // ===================== 核心定时刷新 - 联动大奖金额实时更新+平滑过渡+格式化展示 业务核心逻辑 =====================
    private updateJackpotMoney(): void {
        if (!this._info) return;

        // 获取左右老虎机的大奖数据信息
        const leftSlotMachine = SlotJackpotManager.Instance().getSlotmachineInfo(SDefine.VIP_LOUNGE_ZONEID, this._info.infoLeftBanner.strSlotID);
        const rightSlotMachine = SlotJackpotManager.Instance().getSlotmachineInfo(SDefine.VIP_LOUNGE_ZONEID, this._info.infoRightBanner.strSlotID);

        // ✅ 左侧大奖更新 - 主要大奖(MAJOR) + 平滑过渡 + 格式化展示
        if (ServiceInfoManager.instance.isComingSoonSlot(this._info.infoLeftBanner.strSlotID) === 0) {
            this._numPrevLeftJackpotMoney = Utility.getDisplayJackpotMoney(this._numPrevLeftJackpotMoney, leftSlotMachine.getJackpotForLobbySlot(SDefine.SLOT_JACKPOT_TYPE_MAJOR));
            this.lblLeftJackpot.string = CurrencyFormatHelper.formatNumber(this._numPrevLeftJackpotMoney);
        }

        // ✅ 右侧大奖更新 - 主要大奖(MAJOR) + 平滑过渡 + 格式化展示
        if (ServiceInfoManager.instance.isComingSoonSlot(this._info.infoRightBanner.strSlotID) === 0) {
            this._numPrevRightJackpotMoney = Utility.getDisplayJackpotMoney(this._numPrevRightJackpotMoney, rightSlotMachine.getJackpotForLobbySlot(SDefine.SLOT_JACKPOT_TYPE_MAJOR));
            this.lblRightJackpot.string = CurrencyFormatHelper.formatNumber(this._numPrevRightJackpotMoney);
        }

        // ✅ 中间大奖更新 - 巨型大奖(MEGA) + 平滑过渡 + 格式化展示 (共用左侧老虎机的MEGA大奖)
        this._numPrevCenterJackpotMoney = Utility.getDisplayJackpotMoney(this._numPrevCenterJackpotMoney, leftSlotMachine.getJackpotForLobbySlot(SDefine.SLOT_JACKPOT_TYPE_MEGA));
        this.lblCenterJackpot.string = CurrencyFormatHelper.formatNumber(this._numPrevCenterJackpotMoney);
    }

    // ===================== 私有辅助方法 - 实例化老虎机横幅预制体 挂载到指定容器 =====================
    private createSlotBanner(prefab: cc.Prefab, parentNode: cc.Node): SlotBannerItem {
        const bannerNode = cc.instantiate(prefab);
        parentNode.addChild(bannerNode);
        bannerNode.setPosition(cc.v2(0, 0));
        return bannerNode.getComponent(SlotBannerItem)!;
    }

    // ===================== 私有辅助方法 - 给横幅实例赋值数据并初始化 =====================
    private setSlotBannerInfo(bannerInfo: any, bannerItem: SlotBannerItem | null): void {
        if (TSUtility.isValid(bannerItem)) {
            bannerItem.setLocation("lobby");
            bannerItem.initialize(bannerInfo, SlotBannerType.LINKED);
        }
    }
}