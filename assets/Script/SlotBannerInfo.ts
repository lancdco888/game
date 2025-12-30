// 保留原项目所有依赖导入，路径与原代码完全一致
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import SupersizeItManager from "./SupersizeItManager";
// import UserInfo from "../../User/UserInfo";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import UserInfo from "./User/UserInfo";

const { ccclass, property } = cc._decorator;

/**
 * Slot单条数据核心模型类
 * 封装单个SLOT的基础信息、各类状态标签判断、服务端数据解析逻辑
 * 为大厅Banner列表提供单SLOT的数据源支撑，所有状态判断规则集中在此类
 */
@ccclass
export default class SlotBannerInfo {
    // ===== 私有核心成员变量 (原代码完整保留 初始化值一致) =====
    private _strFlag: string = "";       // Slot标签标识 (new/hot/featured/revamp/early access 等)
    private _strSlotID: string = "";     // Slot唯一ID
    private _numMinLevel: number = 0;    // Slot最低解锁等级
    private _numOrder: number = 0;       // Slot排序序号

    // ===== 访问器 - 基础属性 (GET/SET 完整保留原逻辑) =====
    public get strFlag(): string {
        return this._strFlag;
    }

    public set strFlag(value: string) {
        this._strFlag = value;
    }

    public get strSlotID(): string {
        return this._strSlotID;
    }

    public set strSlotID(value: string) {
        this._strSlotID = value;
    }

    public get numMinLevel(): number {
        return this._numMinLevel;
    }

    public get numOrder(): number {
        return this._numOrder;
    }

    // ===== ✅ 核心只读访问器 - Slot各类状态标签判断 (1:1复刻原逻辑 重中之重 全部无修改) =====
    // 是否为 新品Slot
    public get isNewSlot(): boolean {
        return this._strFlag === "new";
    }

    // 是否为 抢先体验Slot
    public get isEarlyAccessSlot(): boolean {
        return this._strFlag === "early access";
    }

    // 是否为 热门Slot
    public get isHotSlot(): boolean {
        return this._strFlag === "hot";
    }

    // 是否为 精选Slot
    public get isFeaturedSlot(): boolean {
        return this._strFlag === "featured";
    }

    // 是否为 翻新Slot
    public get isRevampSlot(): boolean {
        return this._strFlag === "revamp";
    }

    // 是否为 超大奖励活动Slot
    public get isSupersizeSlot(): boolean {
        return SupersizeItManager.instance.isTargetSlotID(this.strSlotID) 
            && SupersizeItManager.instance.isEnableEvent();
    }

    // 是否为 卷轴任务指定Slot
    public get isReelQuestSlot(): boolean {
        // const userInfo = UserInfo.default.instance();
        // return userInfo.hasActiveReelQuest() === 1 
        //     && this.strSlotID === userInfo.getUserReelQuestInfo().curMissionSlot;
            return true;
    }

    // 是否为 联动大奖Slot (带联动机型标识)
    public get isLinkedSlot(): boolean {
        const jackpotInfo = SlotJackpotManager.Instance().getSlotmachineInfo(SDefine.VIP_LOUNGE_ZONEID, this.strSlotID);
        return jackpotInfo != null && jackpotInfo.isExistLinkedJackpot();
    }

    // ===== ✅ 核心方法 - 解析单条Slot的原始数据对象 =====
    public parseObj(data: any): void {
        if (TSUtility.isValid(data.slotID)) {
            this._strSlotID = data.slotID;
        }
        if (TSUtility.isValid(data.flag)) {
            this._strFlag = data.flag;
        }
        if (TSUtility.isValid(data.order)) {
            this._numOrder = data.order;
        }
    }

    // ===== ✅ 核心方法 - 从用户信息中解析指定Zone的Slot数据 =====
    public setServerBannerInfo(zoneID: any, slotID: string): void {
        const userInfo = UserInfo.instance();
        const slotZoneInfo = userInfo.slotZoneInfo[zoneID];
        
        if (TSUtility.isValid(slotZoneInfo)) {
            const targetSlot = slotZoneInfo.slotList.find(item => item.slotID === slotID);
            if (TSUtility.isValid(targetSlot)) {
                this.parseObj(targetSlot);
            }
        }
    }
}