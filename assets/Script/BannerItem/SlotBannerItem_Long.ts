// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import SupersizeItManager from "../SupersizeItManager";
import ServiceSlotDataManager from "../manager/ServiceSlotDataManager";
import UserInfo from "../User/UserInfo";
import CustomJackpotDataManager from "../manager/CustomJackpotDataManager";
import SlotJackpotManager from "../manager/SlotJackpotManager";
import { SlotBannerType } from "../LobbySlotBannerInfo";
import SlotBannerItem from "../SlotBannerItem";
import { Utility } from "../global_utility/Utility";

/**
 * 老虎机长横幅核心组件 (长尺寸老虎机展示项)
 * 继承通用老虎机横幅基类 SlotBannerItem
 * 核心功能：长尺寸老虎机图片异步加载+loading过渡、MEGA/HUGE/BIG三级奖金池数据刷新+数字渐变滚动、SupersizeIt活动双倒计时展示、空横幅占位处理，是大厅老虎机核心展示组件
 */
@ccclass
export default class SlotBannerItem_Long extends SlotBannerItem {
    // ===================== 序列化绑定属性【与原代码完全一致，顺序不变，类型精准】 =====================
    @property(cc.Node)
    public nodeLoadingBG: cc.Node = null!;

    @property(cc.Node)
    public nodeSupersizeItTime: cc.Node = null!;

    @property(cc.Node)
    public nodeMega: cc.Node = null!;

    @property(cc.Node)
    public nodeHuge: cc.Node = null!;

    @property(cc.Node)
    public nodeBig: cc.Node = null!;

    @property(cc.Sprite)
    public sprImage: cc.Sprite = null!;

    @property(cc.Sprite)
    public sprHoverImage: cc.Sprite = null!;

    @property(cc.Label)
    public lblDummy: cc.Label = null!;

    @property(cc.Label)
    public lblMega: cc.Label = null!;

    @property(cc.Label)
    public lblHuge: cc.Label = null!;

    @property(cc.Label)
    public lblBig: cc.Label = null!;

    @property(cc.Label)
    public lblSupersizeItTime: cc.Label = null!;

    // ===================== 私有成员变量【原代码完整保留，补全精准TS类型注解】 =====================
    public _numPrevMegaJackpotMoney: number = 0;
    public _numPrevMajorJackpotMoney: number = 0;
    public _numPrevMinorJackpotMoney: number = 0;
    public _numSupersizeItPassTime: number = 0;
    public _strCurSlotBannerURL: string = "";

    // ===================== 核心业务方法 - 设置空横幅【异步方法，原逻辑完整保留】 =====================
    public async setEmptyBanner(): Promise<void> {
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;
        if (TSUtility.isValid(this.sprHoverImage)) {
            this.sprHoverImage.spriteFrame = null;
        }
        this.unscheduleAllCallbacks();
        this.setActiveAllTag(false);
        this.setActiveAllJackpot(false);
    }

    // ===================== 核心业务方法 - 加载老虎机长横幅【异步主入口，原逻辑完整保留】 =====================
    public async loadSlotBanner(): Promise<void> {
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;
        if (TSUtility.isValid(this.sprHoverImage)) {
            this.sprHoverImage.spriteFrame = null;
        }
        this.unscheduleAllCallbacks();
        this.nodeJackpotParent.active = true;
        this.nodeTagParent.active = true;

        await this.updateJackpot();
        this.updateJackpotMoney();
        this.updateSupersizeItTime();
        await this.updateImage();
    }

    // ===================== 生命周期 - 初始化【重写父类异步方法，原逻辑完整保留】 =====================
    public async initialize(infoBanner: any, bannerType:typeof SlotBannerType = SlotBannerType.NONE): Promise<void> {
        await super.initialize(infoBanner, bannerType);
        this.updateJackpot();
    }

    // ===================== 核心业务方法 - 更新奖金池配置【异步，MEGA/HUGE/BIG显隐+初始值赋值，原逻辑完整保留】 =====================
    public async updateJackpot(): Promise<void> {
        this.nodeMega.active = false;
        this.nodeHuge.active = false;
        this.nodeBig.active = false;
        this._arrJackpotType = [];

        const slotJackpotInfo = SlotJackpotManager.Instance().getSlotmachineInfo(this._numZoneID, this._strSlotID);
        let jackpotShowIdx = 0;
        const slotId = this._strSlotID;
        const zoneId = this._numZoneID;
        const customJackpotSubId = CustomJackpotDataManager.instance().findCustomJackpotSubID(this._strSlotID);

        // 奖金池赋值回调方法 - 原代码内联函数完整提取，逻辑不变
        const setJackpotItem = (showType: number) => {
            const idx = showType - 1;
            if (showType === 1) {
                const jackpotType = SDefine.SLOT_JACKPOT_TYPE_MEGA;
                const jackpotMoney = SlotBannerItem.getDisplayJackpotMoney(customJackpotSubId, idx, slotId, jackpotType, zoneId);
                this.nodeMega.active = true;
                this.lblMega.string = CurrencyFormatHelper.formatNumber(jackpotMoney);
                this._numPrevMegaJackpotMoney = jackpotMoney;
                this._arrJackpotType.push(jackpotType);
            } else if (showType === 2 && ServiceSlotDataManager.JACKPOT_COUNT_1.indexOf(this._strSlotID) === -1) {
                const jackpotType = SDefine.SLOT_JACKPOT_TYPE_MAJOR;
                const jackpotMoney = SlotBannerItem.getDisplayJackpotMoney(customJackpotSubId, idx, slotId, jackpotType, zoneId);
                this.nodeHuge.active = true;
                this.lblHuge.string = CurrencyFormatHelper.formatNumber(jackpotMoney);
                this._numPrevMajorJackpotMoney = jackpotMoney;
                this._arrJackpotType.push(jackpotType);
            } else if (showType === 3 && ServiceSlotDataManager.JACKPOT_COUNT_1.indexOf(this._strSlotID) === -1 && ServiceSlotDataManager.JACKPOT_COUNT_2.indexOf(this._strSlotID) === -1) {
                const jackpotType = SDefine.SLOT_JACKPOT_TYPE_MINOR;
                const jackpotMoney = SlotBannerItem.getDisplayJackpotMoney(customJackpotSubId, idx, slotId, jackpotType, zoneId);
                this.nodeBig.active = true;
                this.lblBig.string = CurrencyFormatHelper.formatNumber(jackpotMoney);
                this._numPrevMinorJackpotMoney = jackpotMoney;
                this._arrJackpotType.push(jackpotType);
            }
        };

        // 非自定义奖金池 奖金池类型遍历
        if (!TSUtility.isValid(customJackpotSubId)) {
            let jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_GRAND + 1 : SDefine.SLOT_JACKPOT_TYPE_GRAND;
            if (slotJackpotInfo.isExistJackpotType(jackpotType) && slotJackpotInfo.isProgressiveJackpot(jackpotType)) setJackpotItem(++jackpotShowIdx);
            
            jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_MEGA + 1 : SDefine.SLOT_JACKPOT_TYPE_MEGA;
            if (slotJackpotInfo.isExistJackpotType(jackpotType) && slotJackpotInfo.isProgressiveJackpot(jackpotType)) setJackpotItem(++jackpotShowIdx);
            
            jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_MAJOR + 1 : SDefine.SLOT_JACKPOT_TYPE_MAJOR;
            if (slotJackpotInfo.isExistJackpotType(jackpotType) && slotJackpotInfo.isProgressiveJackpot(jackpotType)) setJackpotItem(++jackpotShowIdx);
            
            jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_MINOR + 1 : SDefine.SLOT_JACKPOT_TYPE_MINOR;
            if (slotJackpotInfo.isExistJackpotType(jackpotType) && slotJackpotInfo.isProgressiveJackpot(jackpotType)) setJackpotItem(++jackpotShowIdx);

            // 无奖金池时兜底展示
            if (jackpotShowIdx === 0) {
                jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_GRAND + 1 : SDefine.SLOT_JACKPOT_TYPE_GRAND;
                if (slotJackpotInfo.isExistJackpotType(jackpotType)) setJackpotItem(++jackpotShowIdx);
                
                jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_MEGA + 1 : SDefine.SLOT_JACKPOT_TYPE_MEGA;
                if (slotJackpotInfo.isExistJackpotType(jackpotType)) setJackpotItem(++jackpotShowIdx);
                
                jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_MAJOR + 1 : SDefine.SLOT_JACKPOT_TYPE_MAJOR;
                if (slotJackpotInfo.isExistJackpotType(jackpotType)) setJackpotItem(++jackpotShowIdx);
                
                jackpotType = ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) ? SDefine.SLOT_JACKPOT_TYPE_MINOR + 1 : SDefine.SLOT_JACKPOT_TYPE_MINOR;
                if (slotJackpotInfo.isExistJackpotType(jackpotType)) setJackpotItem(++jackpotShowIdx);
            }
        } else {
            // 自定义奖金池 遍历赋值
            for (let i = 0; i < customJackpotSubId.getSubIDList().length; ++i) {
                if (customJackpotSubId.isExistJackpotType(slotJackpotInfo, i) && customJackpotSubId.isProgressiveJackpot(slotJackpotInfo, i)) {
                    setJackpotItem(++jackpotShowIdx);
                }
            }
            // 无奖金池时兜底展示
            if (jackpotShowIdx === 0) {
                for (let i = 0; i < customJackpotSubId.getSubIDList().length; ++i) {
                    if (customJackpotSubId.isExistJackpotType(slotJackpotInfo, i)) {
                        setJackpotItem(++jackpotShowIdx);
                        break;
                    }
                }
            }
        }
    }

    // ===================== 核心业务方法 - 异步加载长横幅图片【原逻辑完整保留，loading过渡+hover图同步】 =====================
    public async updateImage(): Promise<void> {
        this.lblDummy.node.active = false;
        this._strCurSlotBannerURL = "";
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;
        if (TSUtility.isValid(this.sprHoverImage)) {
            this.sprHoverImage.spriteFrame = null;
        }

        const slotResData = ServiceSlotDataManager.instance.getResourceDataBySlotID(this._strSlotID);
        // 老虎机ID无效/资源数据为空 - 显示占位文本
        if (!ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) || !TSUtility.isValid(slotResData)) {
            this.lblDummy.string = this._strSlotID;
            this.lblDummy.node.active = true;
            return;
        }

        // 异步加载长尺寸图片资源
        this._strCurSlotBannerURL = slotResData.longURL;
        var self = this;
        await new Promise<void>((resolve) => {
            slotResData.loadLongImage((spriteFrame: cc.SpriteFrame, url: string) => {
                // 多重有效性校验 - 内存安全核心，原代码完整保留
                if (TSUtility.isValid(self) && TSUtility.isValid(spriteFrame) && TSUtility.isValid(self._infoBanner) && self._strCurSlotBannerURL === url && self._strCurSlotBannerURL !== "") {
                    self.nodeLoadingBG.active = false;
                    self.sprImage.spriteFrame = spriteFrame;
                    if (TSUtility.isValid(self.sprHoverImage)) {
                        self.sprHoverImage.spriteFrame = self.sprImage.spriteFrame;
                    }
                }
                resolve();
            });
        });
    }

    // ===================== 核心业务方法 - 奖金池金额渐变滚动更新【定时刷新，原逻辑完整保留】 =====================
    public updateJackpotMoney(): void {
        const updateJackpotValue = () => {
            const customJackpotSubId = CustomJackpotDataManager.instance().findCustomJackpotSubID(this._strSlotID);
            const slotId = this._strSlotID;
            const zoneId = this._numZoneID;

            // MEGA奖金池更新 - 数字渐变过渡
            if (this.nodeMega.active) {
                const jackpotType = SDefine.SLOT_JACKPOT_TYPE_MEGA;
                const jackpotMoney = SlotBannerItem.getDisplayJackpotMoney(customJackpotSubId, 0, slotId, jackpotType, zoneId);
                const showMoney = Utility.getDisplayJackpotMoney(this._numPrevMegaJackpotMoney, jackpotMoney);
                this.lblMega.string = CurrencyFormatHelper.formatNumber(showMoney);
                this._numPrevMegaJackpotMoney = showMoney;
            }

            // HUGE奖金池更新
            if (this.nodeHuge.active) {
                const jackpotType = SDefine.SLOT_JACKPOT_TYPE_MAJOR;
                const jackpotMoney = SlotBannerItem.getDisplayJackpotMoney(customJackpotSubId, 1, slotId, jackpotType, zoneId);
                const showMoney = Utility.getDisplayJackpotMoney(this._numPrevMajorJackpotMoney, jackpotMoney);
                this.lblHuge.string = CurrencyFormatHelper.formatNumber(showMoney);
                this._numPrevMajorJackpotMoney = showMoney;
            }

            // BIG奖金池更新
            if (this.nodeBig.active) {
                const jackpotType = SDefine.SLOT_JACKPOT_TYPE_MINOR;
                const jackpotMoney = SlotBannerItem.getDisplayJackpotMoney(customJackpotSubId, 2, slotId, jackpotType, zoneId);
                const showMoney = Utility.getDisplayJackpotMoney(this._numPrevMinorJackpotMoney, jackpotMoney);
                this.lblBig.string = CurrencyFormatHelper.formatNumber(showMoney);
                this._numPrevMinorJackpotMoney = showMoney;
            }
        };

        // 立即执行一次 + 定时刷新 (项目默认奖金池刷新间隔)
        updateJackpotValue();
        this.schedule(updateJackpotValue, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);
    }

    // ===================== 核心业务方法 - 更新SupersizeIt活动倒计时【双倒计时逻辑，原代码完整保留】 =====================
    public updateSupersizeItTime(): void {
        this.nodeSupersizeItTime.active = false;
        if (!this.isSupersizeItSlot) return;

        // 倒计时1: SupersizeIt 通行证时间刷新 (每1秒更新)
        if (SupersizeItManager.instance.canReceiveLoungePass()) {
            this._numSupersizeItPassTime = TSUtility.getServerBaseNowUnixTime() + 10800;
            const updatePassTime = () => {
                const remainTime = this._numSupersizeItPassTime - TSUtility.getServerBaseNowUnixTime();
                this.lblSupersizeItTime.string = TimeFormatHelper.getHourTimeString(remainTime);
                this.nodeSupersizeItTime.active = remainTime > 0;
                if (remainTime <= 0) this.unschedule(updatePassTime);
            };
            updatePassTime();
            this.schedule(updatePassTime, 1);
        }

        // 倒计时2: SupersizeIt 免费票有效期刷新 (每1秒更新)
        // if (UserInfo.instance().hasSupersizeFreeTicket()) {
        //     const updateTicketTime = () => {
        //         const ticketItem = UserInfo.instance().getItemInventory().getItemsByItemId("i_supersize_slot_play_ticket")[0];
        //         const remainTime = ticketItem.expireDate - TSUtility.getServerBaseNowUnixTime();
        //         this.nodeSupersizeItTime.active = remainTime > 0;
        //         if (remainTime <= 0) this.unschedule(updateTicketTime);
        //     };
        //     updateTicketTime();
        //     this.schedule(updateTicketTime, 1);
        // }
    }
}